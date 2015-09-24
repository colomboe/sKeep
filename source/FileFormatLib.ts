/// <reference path="../typings/es6-promise.d.ts" />
/// <reference path="../typings/encoding.d.ts" />
/// <reference path="../typings/pbkdf2.d.ts" />

interface FileFormat {
    load(notebookName: string, fileData: Uint8Array, password: string): Promise<NotebookData>;
    save(notebook: NotebookData, password: string): Promise<Uint8Array>;
}

class FileFormatV0 implements FileFormat {

    load(notebookName: string, fileData: Uint8Array, password: string): Promise<NotebookData> {
        return new Promise((resolve, reject) => {

            var decryptedBytes = new Uint8Array(fileData);
            var decoder = new TextDecoder("utf-8");
            var decryptedString = decoder.decode(decryptedBytes);
            var entries: NotebookDataEntry[] = JSON.parse(decryptedString.substring(6));
            var data: NotebookData = { "name": notebookName, "entries": entries };
            resolve(data);
        });
    }

    save(notebook: NotebookData, password: string): Promise<Uint8Array> {
        return new Promise((resolve, reject) => {

            var data = JSON.stringify(notebook.entries);
            resolve(new TextEncoder("UTF-8").encode(data));
        });
    }
}

class FileFormatV1 implements FileFormat {

    private salt: string = "aoigjfwaojijfa9032qj2tj3qtjaoijf23";

    load(notebookName: string, fileData: Uint8Array, password: string): Promise<NotebookData> {
        
        var iv: Uint8Array = fileData.subarray(6, 22);
        var cipherText: Uint8Array = fileData.subarray(22);

        return new Promise((resolve, reject) => {

            new PBKDF2(password, this.salt, 1024, 32).deriveKey(function () { }, (key) => {

                window.crypto.subtle.importKey(
                    "raw",
                    this.hexToBytes(key),
                    { "name": "AES-CBC", "length": 256 },
                    false,
                    ["encrypt", "decrypt"])

                    .then(function (baseKey) {

                        return window.crypto.subtle.decrypt(
                            {
                                name: "AES-CBC",
                                iv: iv
                            },
                            baseKey,
                            cipherText
                            )
                    })
                    .then(function (plainText) {

                        var decryptedBytes = new Uint8Array(plainText);
                        var decoder = new TextDecoder("utf-8");
                        var decryptedString = decoder.decode(decryptedBytes);
                        var entries: NotebookDataEntry[] = JSON.parse(decryptedString);
                        var data: NotebookData = { name: notebookName, entries: entries };
                        resolve(data);
                    })
                    .catch(function (err) {

                        reject(err);
                    });
            });
        });
    }

    save(notebook: NotebookData, password: string): Promise<Uint8Array> {

        var iv;

        return new Promise((resolve, reject) => {
            
            new PBKDF2(password, this.salt, 1024, 32).deriveKey(function () { }, (key) => {

                window.crypto.subtle.importKey(
                    "raw",
                    this.hexToBytes(key),
                    { "name": "AES-CBC", "length": 256 },
                    false,
                    ["encrypt", "decrypt"])

                    .then((baseKey) => {

                        iv = window.crypto.getRandomValues(new Uint8Array(16));

                        return window.crypto.subtle.encrypt(
                            {
                                name: "AES-CBC",
                                iv: iv
                            },
                            baseKey,
                            new TextEncoder("UTF-8").encode(JSON.stringify(notebook.entries))
                            )
                    })
                    .then((cipherText: Uint8Array) => {

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
        });
    }

    /*--------------------------------------*/

    private hexToBytes(hex: string) {
        for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
        return new Uint8Array(bytes);
    }

}
