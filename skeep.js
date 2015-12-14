/// <reference path="fileformatlib.ts" />
var NotebookEntry = (function () {
    function NotebookEntry(name) {
        this.name = name;
    }
    return NotebookEntry;
})();
var SkeepNotebookManager = (function () {
    function SkeepNotebookManager(storage) {
        this.storage = storage;
    }
    SkeepNotebookManager.prototype.loadNotebookList = function (callback) {
        var _this = this;
        storage.listFiles(function (result) {
            _this.notebooks = [];
            result.forEach(function (s) {
                if (s.indexOf(".skeep") > 0)
                    _this.notebooks.push(new NotebookEntry(s.replace(".skeep", "")));
            });
            _this.nbList = new WinJS.Binding.List(_this.notebooks);
            callback(_this.nbList);
        });
    };
    SkeepNotebookManager.prototype.loadNotebookData = function (index, password) {
        var _this = this;
        var fileName = this.notebooks[index].name + ".skeep";
        storage.loadFile(fileName, function (data) {
            var all = new Uint8Array(data);
            var mark = new TextDecoder("utf-8").decode(all.subarray(0, 5));
            var ver = all.subarray(5, 6)[0];
            if (mark != "SKEEP") {
                alert("Invalid file!");
                return;
            }
            var parser;
            switch (ver) {
                case 0:
                    parser = new FileFormatV0();
                    break;
                case 1:
                    if (ieDetected)
                        parser = new FileFormatV1_IE();
                    else
                        parser = new FileFormatV1();
                    break;
                case 2:
                    if (ieDetected)
                        parser = new FileFormatV2_IE();
                    else
                        parser = new FileFormatV2();
                    break;
                default:
                    alert("Invalid file version!");
                    return;
            }
            parser.load(_this.notebooks[index].name, all, password).then(function (data) {
                _this.currentData = data;
                _this.sdfjaoir3209fj2ihfio = password;
                ui.fillFromNotebook(data);
            }).catch(function (error) {
                console.log(error);
                ui.showLoadingMessage(false);
                alert("An error has occurred while deciphering your data (wrong password?).");
            });
        });
    };
    SkeepNotebookManager.prototype.createNotebook = function (name, password, callback) {
        storage.exists(name + ".skeep", function (exists) {
            if (exists)
                alert("A notebook with this name already exists");
            else {
                var nnb = { name: name, entries: null };
                nnb.entries = [{ title: "New note", real: "Insert your text here...", link: null }];
                getDefaultFileFormat().save(nnb, password).then(function (data) {
                    storage.saveFile(name + ".skeep", data, function (result) {
                        if (true)
                            callback();
                    });
                }).catch(function (err) {
                    alert(err);
                });
            }
        });
    };
    SkeepNotebookManager.prototype.saveNotebook = function (data, callback) {
        var _this = this;
        this.currentData.entries = data;
        getDefaultFileFormat().save(this.currentData, this.sdfjaoir3209fj2ihfio).then(function (data) {
            storage.saveFile(_this.currentData.name + ".skeep", data, function (result) {
                if (true)
                    callback();
                else
                    alert("Error while saving...");
            });
        }).catch(function (err) {
            alert(err);
        });
    };
    return SkeepNotebookManager;
})();
/// <reference path="../typings/es6-promise.d.ts" />
/// <reference path="../typings/encoding.d.ts" />
/// <reference path="../typings/asmcrypto.d.ts" />
/// <reference path="skeepnotebookmanager.ts" />
var FileFormatV0 = (function () {
    function FileFormatV0() {
    }
    FileFormatV0.prototype.load = function (notebookName, fileData, password) {
        return new Promise(function (resolve, reject) {
            var decryptedBytes = new Uint8Array(fileData);
            var decoder = new TextDecoder("utf-8");
            var decryptedString = decoder.decode(decryptedBytes);
            var entries = JSON.parse(decryptedString.substring(6));
            var data = { "name": notebookName, "entries": entries };
            resolve(data);
        });
    };
    FileFormatV0.prototype.save = function (notebook, password) {
        return new Promise(function (resolve, reject) {
            var data = JSON.stringify(notebook.entries);
            resolve(new TextEncoder("UTF-8").encode(data));
        });
    };
    return FileFormatV0;
})();
var FileFormatV1 = (function () {
    function FileFormatV1() {
        this.salt = "aoigjfwaojijfa9032qj2tj3qtjaoijf23";
    }
    FileFormatV1.prototype.load = function (notebookName, fileData, password) {
        var _this = this;
        var iv = fileData.subarray(6, 22);
        var cipherText = fileData.subarray(22);
        return new Promise(function (resolve, reject) {
            var key = asmCrypto.PBKDF2_HMAC_SHA1.bytes(password, _this.salt, 1024, 32);
            window.crypto.subtle.importKey("raw", key, { "name": "AES-CBC", "length": 256 }, false, ["encrypt", "decrypt"])
                .then(function (baseKey) {
                return window.crypto.subtle.decrypt({
                    name: "AES-CBC",
                    iv: iv
                }, baseKey, cipherText);
            })
                .then(function (plainText) {
                var decryptedBytes = new Uint8Array(plainText);
                var decoder = new TextDecoder("utf-8");
                var decryptedString = decoder.decode(decryptedBytes);
                var entries = JSON.parse(decryptedString);
                var data = { name: notebookName, entries: entries };
                resolve(data);
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    FileFormatV1.prototype.save = function (notebook, password) {
        var _this = this;
        var iv;
        return new Promise(function (resolve, reject) {
            var key = asmCrypto.PBKDF2_HMAC_SHA1.bytes(password, _this.salt, 1024, 32);
            window.crypto.subtle.importKey("raw", key, { "name": "AES-CBC", "length": 256 }, false, ["encrypt", "decrypt"])
                .then(function (baseKey) {
                iv = window.crypto.getRandomValues(new Uint8Array(16));
                return window.crypto.subtle.encrypt({
                    name: "AES-CBC",
                    iv: iv
                }, baseKey, new TextEncoder("UTF-8").encode(JSON.stringify(notebook.entries)));
            })
                .then(function (cipherText) {
                var d = new Uint8Array(cipherText.byteLength + 16 + 5 + 1);
                d.set(new TextEncoder("UTF-8").encode("SKEEP"), 0);
                d[5] = 0x01;
                d.set(iv, 6);
                d.set(new Uint8Array(cipherText), 22);
                resolve(d);
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    return FileFormatV1;
})();
var FileFormatV2 = (function () {
    function FileFormatV2() {
    }
    FileFormatV2.prototype.load = function (notebookName, fileData, password) {
        var iv = fileData.subarray(6, 22);
        var salt = new TextDecoder("UTF-8").decode(fileData.subarray(22, 86));
        var cipherText = fileData.subarray(86);
        return new Promise(function (resolve, reject) {
            var key = asmCrypto.PBKDF2_HMAC_SHA1.bytes(password, salt, 4096, 32);
            window.crypto.subtle.importKey("raw", key, { "name": "AES-CBC", "length": 256 }, false, ["encrypt", "decrypt"])
                .then(function (baseKey) {
                return window.crypto.subtle.decrypt({
                    name: "AES-CBC",
                    iv: iv
                }, baseKey, cipherText);
            })
                .then(function (plainText) {
                var decryptedBytes = new Uint8Array(plainText);
                var decoder = new TextDecoder("UTF-8");
                var decryptedString = decoder.decode(decryptedBytes);
                var entries = JSON.parse(decryptedString);
                var data = { name: notebookName, entries: entries };
                resolve(data);
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    FileFormatV2.prototype.save = function (notebook, password) {
        var iv;
        var salt;
        return new Promise(function (resolve, reject) {
            var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            salt = "";
            var tmp = new Uint32Array(64);
            window.crypto.getRandomValues(tmp);
            for (var i = 0; i < 64; i++)
                salt += charset[tmp[i] % charset.length];
            var key = asmCrypto.PBKDF2_HMAC_SHA1.bytes(password, salt, 4096, 32);
            window.crypto.subtle.importKey("raw", key, { "name": "AES-CBC", "length": 256 }, false, ["encrypt", "decrypt"])
                .then(function (baseKey) {
                iv = window.crypto.getRandomValues(new Uint8Array(16));
                return window.crypto.subtle.encrypt({
                    name: "AES-CBC",
                    iv: iv
                }, baseKey, new TextEncoder("UTF-8").encode(JSON.stringify(notebook.entries)));
            })
                .then(function (cipherText) {
                var d = new Uint8Array(cipherText.byteLength + 16 + 5 + 1 + 64);
                d.set(new TextEncoder("UTF-8").encode("SKEEP"), 0);
                d[5] = 0x02;
                d.set(iv, 6);
                d.set(new TextEncoder("UTF-8").encode(salt), 22);
                d.set(new Uint8Array(cipherText), 86);
                resolve(d);
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    return FileFormatV2;
})();
/// <reference path="../typings/asmcrypto.d.ts" />
/// <reference path="../source/FileFormatLib.ts" />
/// <reference path="../source/SkeepNotebookManager.ts" />
var FileFormatV1_IE = (function () {
    function FileFormatV1_IE() {
        this.salt = "aoigjfwaojijfa9032qj2tj3qtjaoijf23";
    }
    FileFormatV1_IE.prototype.load = function (notebookName, fileData, password) {
        var _this = this;
        var iv = fileData.subarray(6, 22);
        var cipherText = fileData.subarray(22);
        return new Promise(function (resolve, reject) {
            var key = asmCrypto.PBKDF2_HMAC_SHA1.bytes(password, _this.salt, 1024, 32);
            var crypto = window.msCrypto;
            var importOp = crypto.subtle.importKey("raw", key, { "name": "AES-CBC", "length": 256 }, false, ["encrypt", "decrypt"]);
            importOp.onerror = function (e) { reject(e); };
            importOp.oncomplete = function (e) {
                var decryptOp = crypto.subtle.decrypt({
                    name: "AES-CBC",
                    iv: iv
                }, e.target.result, cipherText);
                decryptOp.onerror = function (e) { reject(e); };
                decryptOp.oncomplete = function (e) {
                    var decryptedBytes = new Uint8Array(e.target.result);
                    var decoder = new TextDecoder("utf-8");
                    var decryptedString = decoder.decode(decryptedBytes);
                    var entries = JSON.parse(decryptedString);
                    var data = { name: notebookName, entries: entries };
                    resolve(data);
                };
            };
        });
    };
    FileFormatV1_IE.prototype.save = function (notebook, password) {
        var _this = this;
        var iv;
        return new Promise(function (resolve, reject) {
            var key = asmCrypto.PBKDF2_HMAC_SHA1.bytes(password, _this.salt, 1024, 32);
            var crypto = window.msCrypto;
            var importOp = crypto.subtle.importKey("raw", key, { "name": "AES-CBC", "length": 256 }, false, ["encrypt", "decrypt"]);
            importOp.onerror = function (e) { alert("Crypto error 1"); };
            importOp.oncomplete = function (e) {
                iv = crypto.getRandomValues(new Uint8Array(16));
                var decryptOp = crypto.subtle.encrypt({
                    name: "AES-CBC",
                    iv: iv
                }, e.target.result, new TextEncoder("UTF-8").encode(JSON.stringify(notebook.entries)));
                decryptOp.onerror = function (e) { alert("Crypto error 2"); };
                decryptOp.oncomplete = function (e) {
                    var d = new Uint8Array(e.target.result.byteLength + 16 + 5 + 1);
                    d.set(new TextEncoder("UTF-8").encode("SKEEP"), 0);
                    d[5] = 0x01;
                    d.set(iv, 6);
                    d.set(new Uint8Array(e.target.result), 22);
                    resolve(d);
                };
            };
        });
    };
    return FileFormatV1_IE;
})();
var FileFormatV2_IE = (function () {
    function FileFormatV2_IE() {
    }
    FileFormatV2_IE.prototype.load = function (notebookName, fileData, password) {
        var iv = fileData.subarray(6, 22);
        var salt = new TextDecoder("UTF-8").decode(fileData.subarray(22, 86));
        var cipherText = fileData.subarray(86);
        return new Promise(function (resolve, reject) {
            var key = asmCrypto.PBKDF2_HMAC_SHA1.bytes(password, salt, 4096, 32);
            var crypto = window.msCrypto;
            var importOp = crypto.subtle.importKey("raw", key, { "name": "AES-CBC", "length": 256 }, false, ["encrypt", "decrypt"]);
            importOp.onerror = function (e) { reject(e); };
            importOp.oncomplete = function (e) {
                var decryptOp = crypto.subtle.decrypt({
                    name: "AES-CBC",
                    iv: iv
                }, e.target.result, cipherText);
                decryptOp.onerror = function (e) { reject(e); };
                decryptOp.oncomplete = function (e) {
                    var decryptedBytes = new Uint8Array(e.target.result);
                    var decoder = new TextDecoder("UTF-8");
                    var decryptedString = decoder.decode(decryptedBytes);
                    var entries = JSON.parse(decryptedString);
                    var data = { name: notebookName, entries: entries };
                    resolve(data);
                };
            };
        });
    };
    FileFormatV2_IE.prototype.save = function (notebook, password) {
        var iv;
        var salt;
        return new Promise(function (resolve, reject) {
            var crypto = window.msCrypto;
            var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            salt = "";
            var tmp = new Uint32Array(64);
            crypto.getRandomValues(tmp);
            for (var i = 0; i < 64; i++)
                salt += charset[tmp[i] % charset.length];
            var key = asmCrypto.PBKDF2_HMAC_SHA1.bytes(password, salt, 4096, 32);
            var importOp = crypto.subtle.importKey("raw", key, { "name": "AES-CBC", "length": 256 }, false, ["encrypt", "decrypt"]);
            importOp.onerror = function (e) { alert("Crypto error 1"); };
            importOp.oncomplete = function (e) {
                iv = crypto.getRandomValues(new Uint8Array(16));
                var decryptOp = crypto.subtle.encrypt({
                    name: "AES-CBC",
                    iv: iv
                }, e.target.result, new TextEncoder("UTF-8").encode(JSON.stringify(notebook.entries)));
                decryptOp.onerror = function (e) { alert("Crypto error 2"); };
                decryptOp.oncomplete = function (e) {
                    var d = new Uint8Array(e.target.result.byteLength + 16 + 5 + 1 + 64);
                    d.set(new TextEncoder("UTF-8").encode("SKEEP"), 0);
                    d[5] = 0x02;
                    d.set(iv, 6);
                    d.set(new TextEncoder("UTF-8").encode(salt), 22);
                    d.set(new Uint8Array(e.target.result), 86);
                    resolve(d);
                };
            };
        });
    };
    return FileFormatV2_IE;
})();
/// <reference path="../typings/dropboxjs.d.ts" />
/// <reference path="skeepstorage.ts" />
var SkeepDropbox = (function () {
    function SkeepDropbox() {
        this.client = null;
    }
    SkeepDropbox.prototype.init = function (callback) {
        if (this.client == null)
            this.client = new Dropbox.Client(SkeepDropbox.key);
        this.client.reset();
        var opt = {
            interactive: false
        };
        this.client.authenticate({ interactive: false }, function (err, client) {
            callback(client.isAuthenticated());
        });
    };
    SkeepDropbox.prototype.login = function (callback) {
        this.client.reset();
        if (!this.client.isAuthenticated()) {
            this.client.authenticate(function (err, client) {
                if (err != null) {
                    if (err instanceof Dropbox.ApiError)
                        console.log(err.status + " - " + err.responseText);
                    else if (err instanceof Dropbox.AuthError) {
                        console.log(err.code + " - " + err.description);
                    }
                    callback(false);
                }
                else
                    callback(true);
            });
        }
        else
            callback(true);
    };
    SkeepDropbox.prototype.listFiles = function (callback) {
        this.client.readdir(".", function (err, filenames, stat, folderEntries) {
            if (err != null)
                alert(err.status + " - " + err.response);
            else
                callback(filenames);
        });
    };
    SkeepDropbox.prototype.loadFile = function (fileName, callback) {
        this.client.readFile(fileName, { arrayBuffer: true }, function (err, fileContents) {
            if (err != null)
                alert(err.status + " - " + err.response);
            else
                callback(fileContents);
        });
    };
    SkeepDropbox.prototype.exists = function (fileName, callback) {
        this.client.stat(fileName, function (err, stat) {
            callback((!err) && (stat.isRemoved == false));
        });
    };
    SkeepDropbox.prototype.saveFile = function (fileName, data, callback) {
        this.client.writeFile(fileName, data, function (err, stat) {
            if (err)
                console.log(err);
            callback(!err);
        });
    };
    SkeepDropbox.prototype.logout = function (callback) {
        this.client.signOut(function (err) {
            if (err)
                console.log(err);
            callback();
        });
    };
    SkeepDropbox.key = { key: "h0jgf9nop7iztoc" };
    return SkeepDropbox;
})();
/// <reference path="../typings/encoding.d.ts" />
var SkeepFakeStorage = (function () {
    function SkeepFakeStorage() {
    }
    SkeepFakeStorage.prototype.init = function (callback) {
        callback(true);
    };
    SkeepFakeStorage.prototype.login = function (callback) {
        callback(true);
    };
    SkeepFakeStorage.prototype.listFiles = function (callback) {
        callback(["Primo.skeep", "Secondo.skeep", "Terzo.skeep"]);
    };
    SkeepFakeStorage.prototype.loadFile = function (fileName, callback) {
        callback(new TextEncoder("utf-8").encode("SKEEP\0" + '[ { "real": "Ciao\\n$$$aabbcc$$$\\n$$$112233$$$", "title": "Unica" }, { "real": "Ciao2", "title": "Unica2" } ]'));
    };
    SkeepFakeStorage.prototype.exists = function (fileName, callback) {
        callback(false);
    };
    SkeepFakeStorage.prototype.saveFile = function (fileName, data, callback) {
        callback(true);
    };
    SkeepFakeStorage.prototype.logout = function (callback) {
        callback();
    };
    return SkeepFakeStorage;
})();
var ScreenMode;
(function (ScreenMode) {
    ScreenMode[ScreenMode["Standard"] = 1] = "Standard";
    ScreenMode[ScreenMode["Mobile"] = 2] = "Mobile";
    ScreenMode[ScreenMode["Extended"] = 3] = "Extended";
})(ScreenMode || (ScreenMode = {}));
;
var UIManager = (function () {
    function UIManager() {
        var _this = this;
        this.welcomePane = document.getElementById("welcomePane");
        this.labelTitle = document.getElementById("labelTitle");
        this.labelNotebookTitle = document.getElementById("labelNotebookTitle");
        this.progressRing = document.getElementById("progressRing");
        this.cmdLogin = document.getElementById("cmdLogin");
        this.splitViewButton = document.getElementById("splitViewButton").winControl;
        this.splitView = document.getElementById("mainSplitView").winControl;
        this.notebookListView = document.getElementById("notebookListView").winControl;
        this.notebookListPane = document.getElementById("notebookListPane");
        this.notesPane = document.getElementById("notesPane");
        this.noteListView = document.getElementById("noteListView").winControl;
        this.titleLabel = document.getElementById("titleLabel");
        this.linkLabel = document.getElementById("linkLabel");
        this.bodyLabel = document.getElementById("noteBody");
        this.searchBox = document.getElementById("searchBoxBox").winControl;
        this.noteToolbar = document.getElementById("noteToolbar").winControl;
        this.noteToolbarEdit = document.getElementById("noteToolbarEdit").winControl;
        this.cmdBack = document.getElementById("cmdBack");
        this.cmdNotebookList = document.getElementById("cmdNotebookList").winControl;
        this.cmdNotesList = document.getElementById("cmdNotesList").winControl;
        this.cmdLogout = document.getElementById("cmdLogout").winControl;
        this.cmdAbout = document.getElementById("cmdAbout").winControl;
        this.cmdEdit = document.getElementById("cmdEdit");
        this.cmdDelete = document.getElementById("cmdDelete");
        this.loadingDialog = document.getElementById("loadingDialog").winControl;
        this.deleteConfirmDialog = document.getElementById("deleteConfirmDialog").winControl;
        this.showPasswordDialog = document.getElementById("showPasswordDialog").winControl;
        this.newNotebookDialog = document.getElementById("newNotebookDialog").winControl;
        this.openNotebookDialog = document.getElementById("openNotebookDialog").winControl;
        this.aboutDialog = document.getElementById("aboutDialog").winControl;
        this.noteHeader = document.getElementById("noteHeader");
        this.noteHeaderEdit = document.getElementById("noteHeaderEdit");
        this.noteBody = document.getElementById("noteBody");
        this.noteBodyEdit = document.getElementById("noteBodyEdit");
        this.titleText = document.getElementById("titleText");
        this.bodyText = document.getElementById("bodyText");
        this.cmdGenerate = document.getElementById("cmdGenerate");
        this.cmdSave = document.getElementById("cmdSave");
        this.cmdCancel = document.getElementById("cmdCancel");
        this.cmdAdd = document.getElementById("cmdAdd");
        this.passwordShowText = document.getElementById("passwordShowText");
        this.notesViewPane = document.getElementById("notesViewPane");
        this.openNotebookPasswordText = document.getElementById("openNotebookPasswordText");
        this.processScreenModeSetup();
        this.splitViewButton.addEventListener("invoked", function (ev) { _this.notebookListView.forceLayout(); });
        this.cmdLogin.addEventListener("click", function (ev) { _this.onLoginButtonClicked(); });
        this.notebookListView.addEventListener("iteminvoked", function (ev) { _this.startOpenProcedure(ev.detail.itemIndex); });
        this.noteListView.addEventListener("iteminvoked", function (ev) { _this.updateSelectedNote(); });
        this.searchBox.addEventListener("querychanged", function (ev) { _this.updateSearchResult(ev.detail.queryText.toLowerCase()); });
        this.cmdNotebookList.addEventListener("click", function (ev) { _this.showNotebookListPane(); });
        this.cmdNotesList.addEventListener("click", function (ev) { _this.showNotesPane(); });
        this.cmdAbout.addEventListener("click", function (ev) { _this.aboutDialog.show(); });
        this.cmdEdit.addEventListener("click", function (ev) { _this.startEditing(); });
        this.cmdDelete.addEventListener("click", function (ev) { _this.deleteNote(); });
        this.cmdCancel.addEventListener("click", function (ev) { _this.closeEditing(); });
        this.cmdSave.addEventListener("click", function (ev) { _this.saveEditing(); });
        this.cmdGenerate.addEventListener("click", function (ev) { _this.generatePassword(); });
        this.cmdAdd.addEventListener("click", function (ev) { _this.handleAdd(); });
        this.cmdBack.addEventListener("click", function (ev) { _this.backToNotesListPane(); });
        this.cmdLogout.addEventListener("click", function (ev) { _this.onLogout(); });
        this.openNotebookPasswordText.addEventListener("keyup", function (ev) {
            if (ev.keyCode == 13)
                _this.openNotebookDialog.hide(WinJS.UI.ContentDialog.DismissalResult.primary);
        });
    }
    UIManager.prototype.processScreenModeSetup = function () {
        var _this = this;
        switch (this.getScreenMode()) {
            case 1:
                this.splitView.closedDisplayMode = WinJS.UI.SplitView.ClosedDisplayMode.inline;
                this.splitView.openedDisplayMode = WinJS.UI.SplitView.OpenedDisplayMode.overlay;
                break;
            case 2:
                this.splitView.closedDisplayMode = WinJS.UI.SplitView.ClosedDisplayMode.none;
                this.splitView.openedDisplayMode = WinJS.UI.SplitView.OpenedDisplayMode.overlay;
                break;
            case 3:
                this.splitView.closedDisplayMode = WinJS.UI.SplitView.ClosedDisplayMode.inline;
                this.splitView.openedDisplayMode = WinJS.UI.SplitView.OpenedDisplayMode.inline;
                setTimeout(function () { _this.splitView.openPane(); _this.notebookListView.forceLayout(); }, 1);
                break;
        }
    };
    UIManager.prototype.getScreenMode = function () {
        var state = parseInt(window.getComputedStyle(document.getElementById("modeIndicator")).getPropertyValue('z-index'), 10);
        return state;
    };
    UIManager.prototype.showLoginButton = function () {
        this.cmdLogin.style.display = "inline";
        this.progressRing.style.display = "none";
    };
    UIManager.prototype.showProgressRing = function () {
        this.cmdLogin.style.display = "none";
        this.progressRing.style.display = "inline";
    };
    UIManager.prototype.setNotebookList = function (data) {
        this.notebookListView.itemDataSource = data.dataSource;
        this.welcomePane.style.top = "-100%";
    };
    UIManager.prototype.extractLink = function (entry) {
        entry.link = "";
        var m = entry.real.match(/(https:\/\/\S+)/g);
        if (m != null) {
            entry.link = m[0];
            return;
        }
        m = entry.real.match(/(http:\/\/\S+)/g);
        if (m != null) {
            entry.link = m[0];
            return;
        }
        m = /[^\/\n]?(www\S+)/g.exec(entry.real);
        if (m != null) {
            entry.link = m[1];
            return;
        }
    };
    UIManager.prototype.fillFromNotebook = function (data) {
        var _this = this;
        data.entries.forEach(function (e) { return _this.extractLink(e); });
        this.notesData = new WinJS.Binding.List([]);
        data.entries.forEach(function (e) { return _this.notesData.push(WinJS.Binding.as(e)); });
        this.labelNotebookTitle.innerHTML = data.name;
        this.showNotesPane();
        this.noteListView.itemDataSource = this.notesData.dataSource;
        this.noteListView.selection.set(0);
        this.updateSelectedNote();
        if (this.getScreenMode() == 2)
            this.backToNotesListPane();
    };
    UIManager.prototype.updateSelectedNote = function () {
        var _this = this;
        if (this.noteListView.selection.count() == 0)
            return;
        this.closeEditing();
        return new Promise(function (resolve, reject) {
            _this.noteListView.selection.getItems().then(function (is) {
                _this.selected = is[0].data;
                _this.titleLabel.innerHTML = _this.selected.title;
                if (_this.selected.link !== "") {
                    var simepleLink = _this.selected.link.replace(/^https?\:\/\//, "").replace(/\/$/, "");
                    var realLink = _this.selected.link.substr(0, 4) == "http" ? _this.selected.link : "http://" + _this.selected.link;
                    _this.linkLabel.innerHTML = "<a target=\"_blank\" href=\"" + realLink + "\">" + simepleLink + "</a>";
                }
                else
                    _this.linkLabel.innerHTML = "-";
                _this.bodyLabel.innerHTML = _this.formatBodyText(_this.selected.real);
                WinJS.UI.Animation.enterContent(_this.titleLabel, null);
                WinJS.UI.Animation.enterContent(_this.linkLabel, null);
                WinJS.UI.Animation.enterContent(_this.bodyLabel, null);
                _this.refreshNoteToolbar();
                _this.notesViewPane.style.display = "";
                _this.loadingDialog.hide();
                resolve(_this.selected);
            });
        });
    };
    UIManager.prototype.refreshNoteToolbar = function () {
        if (this.getScreenMode() == 2) {
            if (!ieDetected)
                this.cmdBack.style.marginRight = null;
            this.noteToolbar.forceLayout();
            if (!ieDetected)
                this.cmdBack.style.marginRight = "auto";
        }
        else {
            this.noteToolbar.forceLayout();
            this.cmdBack.style.display = "none";
        }
    };
    UIManager.prototype.formatBodyText = function (body) {
        body = body.replace(/\$\$\$.+?\$\$\$/g, function (m) {
            var bp = btoa(encodeURIComponent(m));
            return "<a href=\"#\" onclick=\"ui.showPassword('" + bp + "');\">●●●●●●●●●●●●●●●●</a>";
        });
        body = body.replace(/(https:\/\/\S+)/g, "<a href=\"$1\" target=\"_blank\">$1</a>");
        body = body.replace(/(http:\/\/\S+)/g, "<a href=\"$1\" target=\"_blank\">$1</a>");
        body = body.replace(/([^\/\n])(www\S+)/g, "$1<a href=\"http://$2\" target=\"_blank\">$2</a>");
        body = body.replace(/\n/g, '<br>');
        return body;
    };
    UIManager.prototype.updateSearchResult = function (query) {
        if (query == "")
            this.noteListView.itemDataSource = this.notesData.dataSource;
        else {
            var filtered = this.notesData.createFiltered(function (i) {
                return ((i.title.toLowerCase().indexOf(query) >= 0)
                    || (i.real.toLowerCase().indexOf(query) >= 0));
            });
            this.noteListView.itemDataSource = filtered.dataSource;
        }
    };
    ;
    UIManager.prototype.showNotesPane = function () {
        if (this.notesData == null) {
            alert("Please choose a notebook before switching to the notes and passwords view.");
            return;
        }
        this.labelTitle.style.display = "none";
        this.labelNotebookTitle.style.display = "";
        this.notesPane.style.display = "";
        this.notebookListPane.style.display = "none";
    };
    UIManager.prototype.showNotebookListPane = function () {
        this.labelTitle.style.display = "";
        this.labelNotebookTitle.style.display = "none";
        this.notesPane.style.display = "none";
        this.notebookListPane.style.display = "";
    };
    UIManager.prototype.showLoadingMessage = function (show) {
        if (show === void 0) { show = true; }
        if (show)
            this.loadingDialog.show();
        else
            this.loadingDialog.hide();
    };
    UIManager.prototype.startEditing = function () {
        this.searchBox.focusOnKeyboardInput = false;
        this.noteHeader.style.display = "none";
        this.noteHeaderEdit.style.display = "";
        this.noteBody.style.display = "none";
        this.noteBodyEdit.style.display = "";
        this.titleText.value = this.selected.title;
        this.bodyText.value = this.selected.real;
        this.bodyText.focus();
        this.noteToolbar.element.style.display = "none";
        this.noteToolbarEdit.element.style.display = "";
        this.noteToolbarEdit.forceLayout();
    };
    ;
    UIManager.prototype.deleteNote = function () {
        var _this = this;
        if (this.notesData.length <= 1) {
            alert("At least one note must exist inside a notebook.");
            return;
        }
        this.deleteConfirmDialog.show().then(function (info) {
            if (info.result === "secondary") {
                var indicesList = _this.noteListView.selection.getIndices().sort(function (a, b) { return a - b; });
                for (var j = indicesList.length - 1; j >= 0; j--)
                    _this.notesData.splice(indicesList[j], 1);
                _this.noteListView.selection.set(0);
                setTimeout(function () { _this.updateSelectedNote().then(function () { return _this.save(); }); }, 1);
            }
        });
    };
    UIManager.prototype.closeEditing = function () {
        this.searchBox.focusOnKeyboardInput = true;
        this.noteHeader.style.display = "";
        this.noteHeaderEdit.style.display = "none";
        this.noteBody.style.display = "";
        this.noteBodyEdit.style.display = "none";
        this.noteToolbar.element.style.display = "";
        this.noteToolbarEdit.element.style.display = "none";
        this.refreshNoteToolbar();
    };
    UIManager.prototype.saveEditing = function () {
        var _this = this;
        this.selected.title = this.titleText.value;
        this.selected.real = this.bodyText.value;
        this.extractLink(this.selected);
        this.updateSelectedNote().then(function () { return _this.save(); });
    };
    UIManager.prototype.save = function () {
        var newList = [];
        for (var i = 0; i < this.notesData.length; i++) {
            var note = this.notesData.getAt(i);
            var newNote = { title: note.title, real: note.real, link: null };
            newList.push(newNote);
        }
        this.onSaveNotebook(newList);
    };
    UIManager.prototype.generatePassword = function () {
        this.bodyText.focus();
        var newPassword = '$$$';
        var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@#!';
        for (var i = 16; i > 0; --i)
            newPassword += chars[Math.round(Math.random() * (chars.length - 1))];
        newPassword += "$$$";
        var startPos = this.bodyText.selectionStart;
        var endPos = this.bodyText.selectionEnd;
        var original = this.bodyText.value;
        this.bodyText.value = original.substring(0, startPos)
            + newPassword
            + original.substring(endPos, original.length);
        this.bodyText.selectionStart = startPos;
        this.bodyText.selectionEnd = startPos + newPassword.length;
    };
    UIManager.prototype.handleAdd = function () {
        var _this = this;
        if (this.notebookListPane.style.display == "") {
            this.newNotebookDialog.show().then(function (info) {
                if (info.result === "primary") {
                    var createNotebookNameText = document.getElementById("createNotebookNameText");
                    var createNotebookPasswordText = document.getElementById("createNotebookPasswordText");
                    var createNotebookPasswordRepeatText = document.getElementById("createNotebookPasswordRepeatText");
                    var name = createNotebookNameText.value;
                    var pwd = createNotebookPasswordText.value;
                    var pwdRepeat = createNotebookPasswordRepeatText.value;
                    createNotebookPasswordText.value = "";
                    createNotebookPasswordRepeatText.value = "";
                    if (pwd !== pwdRepeat) {
                        alert("The two passwords provided differ. Please retry.");
                        return;
                    }
                    if ((name != null) && (pwd != null)) {
                        createNotebookNameText.value = "";
                        _this.onCreateNotebook(name, pwd);
                    }
                }
            });
        }
        else {
            var newEntry = { real: "Insert your text here...", title: "New note", link: "" };
            this.notesData.push(WinJS.Binding.as(newEntry));
            this.noteListView.selection.set(this.notesData.length - 1).then(function () {
                _this.updateSelectedNote().then(function (s) {
                    _this.startEditing();
                    _this.titleText.focus();
                    _this.titleText.setSelectionRange(0, _this.titleText.value.length);
                });
            });
        }
    };
    UIManager.prototype.showPassword = function (bp) {
        var _this = this;
        var pwd = decodeURIComponent(atob(bp));
        this.passwordShowText.value = pwd.substr(3, pwd.length - 6);
        this.showPasswordDialog.show().then(function (ev) {
            _this.passwordShowText.focus();
        });
    };
    UIManager.prototype.backToNotesListPane = function () {
        this.notesViewPane.style.display = "none";
    };
    UIManager.prototype.startOpenProcedure = function (index) {
        var _this = this;
        this.openNotebookDialog.show().then(function (info) {
            if (info.result === "primary") {
                var p = _this.openNotebookPasswordText.value;
                _this.openNotebookPasswordText.value = "";
                _this.onNotebookSelected(index, p);
            }
        });
    };
    return UIManager;
})();
/// <reference path="../typings/winjs.d.ts" />
/// <reference path="SkeepDropbox.ts" />
/// <reference path="SkeepNotebookManager.ts" />
/// <reference path="UIManager.ts" />
/// <reference path="SkeepFakeStorage.ts" />
/// <reference path="FileFormatLib.ts" />
/// <reference path="FileFormatLib_IE.ts" />
var storage = new SkeepDropbox();
var manager = new SkeepNotebookManager(storage);
var ui;
function getDefaultFileFormat() {
    if (ieDetected)
        return new FileFormatV2_IE();
    else
        return new FileFormatV2();
}
var ieDetected = true;
if (typeof document.documentMode === "undefined") {
    ieDetected = false;
}
document.addEventListener("DOMContentLoaded", function () {
    WinJS.UI.processAll().done(function () {
        ui = new UIManager();
        ui.showProgressRing();
        storage.init(function (result) {
            if (result == true) {
                manager.loadNotebookList(function (notebooks) {
                    ui.setNotebookList(notebooks);
                });
            }
            else
                ui.showLoginButton();
        });
        ui.onLoginButtonClicked = function () {
            storage.login(function (result) {
                if (result == true) {
                    manager.loadNotebookList(function (notebooks) {
                        ui.setNotebookList(notebooks);
                    });
                }
            });
        };
        ui.onNotebookSelected = function (index, password) {
            ui.showLoadingMessage();
            manager.loadNotebookData(index, password);
        };
        ui.onCreateNotebook = function (name, password) {
            ui.showLoadingMessage();
            manager.createNotebook(name, password, function () {
                manager.loadNotebookList(function (notebooks) {
                    ui.setNotebookList(notebooks);
                    ui.showLoadingMessage(false);
                });
            });
        };
        ui.onSaveNotebook = function (data) {
            ui.showLoadingMessage();
            manager.saveNotebook(data, function () {
                ui.showLoadingMessage(false);
            });
        };
        ui.onLogout = function () {
            storage.logout(function () {
                window.location.reload();
            });
        };
    });
});
//# sourceMappingURL=skeep.js.map