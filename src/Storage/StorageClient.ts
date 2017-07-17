interface StorageClient {
    alreadyLogged(): Promise<LoginData>;
    login(): void;
    listFiles(): Promise<string[]>;
    loadFile(fileName: string): Promise<Uint8Array>;
    exists(fileName: string, callback: (exists: boolean) => void): void;
    saveFile(fileName: string, data: any): Promise<void>;
    logout(): Promise<void>;
}

interface LoginData {
    logged: boolean;
    email?: string;
    name?: string;
}