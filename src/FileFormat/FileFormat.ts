interface FileFormat {
    encode(notebook: Notebook, password: string): Promise<Uint8Array>;
    decode(name: string, fileData: Uint8Array, password: string): Promise<Notebook>;
}