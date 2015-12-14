/// <reference path="../typings/es6-promise.d.ts" />
/// <reference path="../typings/encoding.d.ts" />
/// <reference path="../typings/asmcrypto.d.ts" />
/// <reference path="skeepnotebookmanager.ts" />

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

            var key = asmCrypto.PBKDF2_HMAC_SHA1.bytes(password, this.salt, 1024, 32);
            window.crypto.subtle.importKey(
                "raw",
                key,
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
    }

    save(notebook: NotebookData, password: string): Promise<Uint8Array> {

        var iv;

        return new Promise((resolve, reject) => {
            
            var key = asmCrypto.PBKDF2_HMAC_SHA1.bytes(password, this.salt, 1024, 32);
            window.crypto.subtle.importKey(
                "raw",
                key,
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
    }
}

class FileFormatV2 implements FileFormat {

    load(notebookName: string, fileData: Uint8Array, password: string): Promise<NotebookData> {
        
        var iv: Uint8Array = fileData.subarray(6, 22);
        var salt: string = new TextDecoder("UTF-8").decode(fileData.subarray(22, 86));
        var cipherText: Uint8Array = fileData.subarray(86);

        return new Promise((resolve, reject) => {

            var key = asmCrypto.PBKDF2_HMAC_SHA1.bytes(password, salt, 4096, 32);
            window.crypto.subtle.importKey(
                "raw",
                key,
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
                    var decoder = new TextDecoder("UTF-8");
                    var decryptedString = decoder.decode(decryptedBytes);
                    var entries: NotebookDataEntry[] = JSON.parse(decryptedString);
                    var data: NotebookData = { name: notebookName, entries: entries };
                    resolve(data);
                })
                .catch(function (err) {

                    reject(err);
                });
        });
    }

    save(notebook: NotebookData, password: string): Promise<Uint8Array> {

        var iv;
        var salt: string;

        return new Promise((resolve, reject) => {
            
            var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            salt = "";
            var tmp = new Uint32Array(64);
            window.crypto.getRandomValues(tmp);
            for (var i = 0; i < 64; i++)
                salt += charset[tmp[i] % charset.length];
            
            var key = asmCrypto.PBKDF2_HMAC_SHA1.bytes(password, salt, 4096, 32);
            window.crypto.subtle.importKey(
                "raw",
                key,
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
    }
}