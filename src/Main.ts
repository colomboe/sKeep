document.addEventListener("DOMContentLoaded", async () => {
    // console.log((<any>asmCrypto).random.seed(crypto.getRandomValues(new Uint32Array(256))));
    await new Application().start();
});