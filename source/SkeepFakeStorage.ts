/// <reference path="../typings/encoding.d.ts" />

class SkeepFakeStorage implements SkeepStorage {
    
    init(callback: (result: boolean) => void) {
        callback(true);
    }

    login(callback: (result: boolean) => void) {
        callback(true);
    }

    listFiles(callback: (result: string[]) => void) {
        callback(["Primo.skeep", "Secondo.skeep", "Terzo.skeep"]);
    }

    loadFile(fileName: string, callback: (data: ArrayBuffer) => void): void {

        callback(new TextEncoder("utf-8").encode("SKEEP\0" + '[ { "real": "Ciao\\n$$$aabbcc$$$\\n$$$112233$$$", "title": "Unica" }, { "real": "Ciao2", "title": "Unica2" } ]'));
    }

    exists(fileName: string, callback: (exists: boolean) => void): void {

        callback(false);
    }

    saveFile(fileName: string, data: any, callback: (result: boolean) => void): void {

        callback(true);
    }

    logout(callback: () => void): void {

        callback();
    }
}