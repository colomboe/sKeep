/// <reference path="../source/FileFormatLib.ts" />
/// <reference path="../source/SkeepNotebookManager.ts" />

class FileFormatV1_IE implements FileFormat {

    private salt: string = "aoigjfwaojijfa9032qj2tj3qtjaoijf23";

    load(notebookName: string, fileData: Uint8Array, password: string): Promise<NotebookData> {

        var iv: Uint8Array = fileData.subarray(6, 22);
        var cipherText: Uint8Array = fileData.subarray(22);

        return new Promise((resolve, reject) => {

            new PBKDF2(password, this.salt, 1024, 32).deriveKey(function () { }, (key) => {

                var crypto = window.crypto || window.msCrypto;
                var importOp = crypto.subtle.importKey(
                    "raw",
                    this.hexToBytes(key),
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
        });
    }

    save(notebook: NotebookData, password: string): Promise<Uint8Array> {

        var iv;

        return new Promise((resolve, reject) => {

            new PBKDF2(password, this.salt, 1024, 32).deriveKey(function () { }, (key) => {

                var crypto = window.crypto || window.msCrypto;
                var importOp = crypto.subtle.importKey(
                    "raw",
                    this.hexToBytes(key),
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
        });
    }

    /*--------------------------------------*/

    private hexToBytes(hex: string) {
        for (var bytes = [], c = 0; c < hex.length; c += 2)
            bytes.push(parseInt(hex.substr(c, 2), 16));
        return new Uint8Array(bytes);
    }

}
