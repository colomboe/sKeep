class MockStorageClient implements StorageClient {

    private files = ["aaa.skeep", "bbb.skeep", "ccc.skeep"];
    private baseNotebook: Notebook = { name: name, entries: [
        { title: "New note", real: "Insert your text here 111...", link: null },
	{ title: "New note 2", real: "Insert your text www.msn.com here...", link: null },
	{ title: "New note 3", real: "Insert your text here...\nUsername: ###pippo@pluto.com###\nPassword: $$$pippo$$$\n www.libero.it\n * aaa\n * bbb\n * ccc", link: null },
        { title: "New note 4", real: "Insert your text here...\nPassword: $$$pippo$$$\n www.libero.it", link: null }
    ] };

    alreadyLogged(): Promise<boolean> {
        return new Promise((s,e) => { s(true) });
    }

    login() {
        window.location.href = "http://www.google.it/";
    }

    listFiles(): Promise<string[]> {
        return new Promise((s,e) => { setTimeout(() => s(this.files), 1000); });
    }

    loadFile(fileName: string): Promise<Uint8Array> {
        return new Promise((s,e) => { setTimeout(async () => s(await new PlainFileFormat().encode(this.baseNotebook, "")), 1000); });
    }

    exists(fileName: string, callback: (exists: boolean) => void): void {

    }

    saveFile(fileName: string, data: any): Promise<void> {
        this.files.push(fileName);
        return new Promise<void>((s,e) => { setTimeout(() => s(), 1000); });
    }

    logout(): Promise<void> {
        return new Promise<void>((s,e) => { setTimeout(() => { s(); }, 3000); });
    }

}
