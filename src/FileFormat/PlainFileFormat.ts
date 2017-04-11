class PlainFileFormat implements FileFormat {

    private readonly FAKE_PASSWORD: string = "pippo";

    public async decode(name: string, data: Uint8Array, password: string): Promise<Notebook> {
        if (password !== this.FAKE_PASSWORD) throw "INVALID_PASSWORD";
        var json = new TextDecoder("UTF-8").decode(data);
        return { name: name, entries: JSON.parse(json) };
    }

    public async encode(notebook: Notebook, password: string): Promise<Uint8Array> {
        var data = JSON.stringify(notebook.entries);
        return (new TextEncoder("UTF-8").encode(data));
    }

}