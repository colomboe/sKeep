class FileFormatV2 implements FileFormat {

    public async encode(notebook: Notebook, password: string): Promise<Uint8Array> {
        var textEncoder = new TextEncoder("UTF-8");
        var charset: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var salt: string = "";
        var tmp: Uint32Array = new Uint32Array(crypto.getRandomValues(new Uint32Array(64)).buffer);
        for (var i = 0; i < 64; i++) salt += charset[tmp[i] % charset.length];
        var key = asmCrypto.PBKDF2_HMAC_SHA1.bytes(password, salt, 4096, 32);
        var iv: ArrayBufferView = crypto.getRandomValues(new Uint8Array(16));
        var baseKey: CryptoKey = await crypto.subtle.importKey("raw", key, { name: "AES-CBC", length: 256 }, false, ["encrypt", "decrypt"]);
        var cipherText: ArrayBuffer = await crypto.subtle.encrypt({ name: "AES-CBC", iv: iv }, baseKey, textEncoder.encode(JSON.stringify(notebook.entries)));
        var data: Uint8Array = new Uint8Array(cipherText.byteLength + 16 + 5 + 1 + 64);
        data.set(textEncoder.encode("SKEEP"), 0);
        data[5] = 0x02;
        data.set(new Uint8Array(iv.buffer), 6);
        data.set(textEncoder.encode(salt), 22);
        data.set(new Uint8Array(cipherText), 86);
        return data;
    }

    public async decode(name: string, fileData: Uint8Array, password: string): Promise<Notebook> {
        var iv: Uint8Array = fileData.subarray(6, 22);
        var salt: string = new TextDecoder("UTF-8").decode(fileData.subarray(22, 86));
        var cipherText: Uint8Array = fileData.subarray(86);
        var key = asmCrypto.PBKDF2_HMAC_SHA1.bytes(password, salt, 4096, 32);
        var baseKey: CryptoKey = await crypto.subtle.importKey("raw", key, { name: "AES-CBC", length: 256}, false, ["encrypt", "decrypt"]);
        var plainData: ArrayBuffer = await crypto.subtle.decrypt({ name: "AES-CBC", iv: iv }, baseKey, cipherText);
        var plainText: string = new TextDecoder("UTF-8").decode(new Uint8Array(plainData));
        return { name: name, entries: JSON.parse(plainText) };
    }
}