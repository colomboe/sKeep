interface SkeepStorage {
    init(callback: (result: boolean) => void);
    login(callback: (result: boolean) => void);
    listFiles(callback: (result: string[]) => void);
    loadFile(fileName: string, callback: (data: ArrayBuffer) => void): void;
    exists(fileName: string, callback: (exists: boolean) => void): void;
    saveFile(fileName: string, data: any, callback: (result: boolean) => void): void;
    logout(callback: () => void): void;
}