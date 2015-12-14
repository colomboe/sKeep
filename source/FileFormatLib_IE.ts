/// <reference path="../typings/asmcrypto.d.ts" />
/// <reference path="../source/FileFormatLib.ts" />
/// <reference path="../source/SkeepNotebookManager.ts" />

class FileFormatV1_IE implements FileFormat {

    private salt: string = "aoigjfwaojijfa9032qj2tj3qtjaoijf23";

    load(notebookName: string, fileData: Uint8Array, password: string): Promise<NotebookData> {

        var iv: Uint8Array = fileData.subarray(6, 22);
        var cipherText: Uint8Array = fileData.subarray(22);

        return new Promise((resolve, reject) => {

            var key = asmCrypto.PBKDF2_HMAC_SHA1.bytes(password, this.salt, 1024, 32);

            var crypto = window.msCrypto;
            var importOp = crypto.subtle.importKey(
                "raw",
                key,
                { "name": "AES-CBC", "length": 256 },
                false,
                ["encrypt", "decrypt"]
            );

            importOp.onerror = function (e) { reject(e); }
            importOp.oncomplete = function (e) {

                var decryptOp = crypto.subtle.decrypt(
                    {
                        name: "AES-CBC",
                        iv: iv
                    },
                    e.target.result,
                    cipherText
                    );

                decryptOp.onerror = function (e) { reject(e); }
                decryptOp.oncomplete = function (e) {

                    var decryptedBytes = new Uint8Array(e.target.result);
                    var decoder = new TextDecoder("utf-8");
                    var decryptedString = decoder.decode(decryptedBytes);
                    var entries: NotebookDataEntry[] = JSON.parse(decryptedString);
                    var data: NotebookData = { name: notebookName, entries: entries };
                    resolve(data);
                }
            }
        });
    }

    save(notebook: NotebookData, password: string): Promise<Uint8Array> {

        var iv;

        return new Promise((resolve, reject) => {

            var key = asmCrypto.PBKDF2_HMAC_SHA1.bytes(password, this.salt, 1024, 32);

            var crypto = window.msCrypto;
            var importOp = crypto.subtle.importKey(
                "raw",
                key,
                { "name": "AES-CBC", "length": 256 },
                false,
                ["encrypt", "decrypt"]
                );

            importOp.onerror = function (e) { alert("Crypto error 1"); }
            importOp.oncomplete = function (e) {

                iv = crypto.getRandomValues(new Uint8Array(16));

                var decryptOp = crypto.subtle.encrypt(
                    {
                        name: "AES-CBC",
                        iv: iv
                    },
                    e.target.result,
                    new TextEncoder("UTF-8").encode(JSON.stringify(notebook.entries))
                    );

                decryptOp.onerror = function (e) { alert("Crypto error 2"); }
                decryptOp.oncomplete = function (e) {

                    var d = new Uint8Array(e.target.result.byteLength + 16 + 5 + 1);
                    d.set(new TextEncoder("UTF-8").encode("SKEEP"), 0);
                    d[5] = 0x01;
                    d.set(iv, 6);
                    d.set(new Uint8Array(e.target.result), 22);
                    resolve(d);
                }
            }
        });
    }
}

class FileFormatV2_IE implements FileFormat {

    load(notebookName: string, fileData: Uint8Array, password: string): Promise<NotebookData> {

        var iv: Uint8Array = fileData.subarray(6, 22);
        var salt: string = new TextDecoder("UTF-8").decode(fileData.subarray(22, 86));
        var cipherText: Uint8Array = fileData.subarray(86);
        
        return new Promise((resolve, reject) => {

            var key = asmCrypto.PBKDF2_HMAC_SHA1.bytes(password, salt, 4096, 32);

            var crypto = window.msCrypto;
            var importOp = crypto.subtle.importKey(
                "raw",
                key,
                { "name": "AES-CBC", "length": 256 },
                false,
                ["encrypt", "decrypt"]
            );

            importOp.onerror = function (e) { reject(e); }
            importOp.oncomplete = function (e) {

                var decryptOp = crypto.subtle.decrypt(
                    {
                        name: "AES-CBC",
                        iv: iv
                    },
                    e.target.result,
                    cipherText
                    );

                decryptOp.onerror = function (e) { reject(e); }
                decryptOp.oncomplete = function (e) {

                    var decryptedBytes = new Uint8Array(e.target.result);
                    var decoder = new TextDecoder("UTF-8");
                    var decryptedString = decoder.decode(decryptedBytes);
                    var entries: NotebookDataEntry[] = JSON.parse(decryptedString);
                    var data: NotebookData = { name: notebookName, entries: entries };
                    resolve(data);
                }
            }
        });
    }

    save(notebook: NotebookData, password: string): Promise<Uint8Array> {

        var iv;
        var salt: string;

        return new Promise((resolve, reject) => {
            
            var crypto = window.msCrypto;

            var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            salt = "";
            var tmp = new Uint32Array(64);
            crypto.getRandomValues(tmp);
            for (var i = 0; i < 64; i++)
                salt += charset[tmp[i] % charset.length];

            var key = asmCrypto.PBKDF2_HMAC_SHA1.bytes(password, salt, 4096, 32);
            
            var importOp = crypto.subtle.importKey(
                "raw",
                key,
                { "name": "AES-CBC", "length": 256 },
                false,
                ["encrypt", "decrypt"]
                );

            importOp.onerror = function (e) { alert("Crypto error 1"); }
            importOp.oncomplete = function (e) {

                iv = crypto.getRandomValues(new Uint8Array(16));

                var decryptOp = crypto.subtle.encrypt(
                    {
                        name: "AES-CBC",
                        iv: iv
                    },
                    e.target.result,
                    new TextEncoder("UTF-8").encode(JSON.stringify(notebook.entries))
                    );

                decryptOp.onerror = function (e) { alert("Crypto error 2"); }
                decryptOp.oncomplete = function (e) {

                    var d = new Uint8Array(e.target.result.byteLength + 16 + 5 + 1 + 64);
                    d.set(new TextEncoder("UTF-8").encode("SKEEP"), 0);
                    d[5] = 0x02;
                    d.set(iv, 6);
                    d.set(new TextEncoder("UTF-8").encode(salt), 22);
                    d.set(new Uint8Array(e.target.result), 86);
                    
                    resolve(d);
                }
            }
        });
    }
}
