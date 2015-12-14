/// <reference path="fileformatlib.ts" />

class NotebookEntry {
    public name: string;

    constructor(name: string) {
        this.name = name;
    }
}

interface NotebookDataEntry {
    real: string;
    title: string;
    link: string;
}

interface NotebookData {
    name: string;
    entries: NotebookDataEntry[];
}

class SkeepNotebookManager {

    private storage: SkeepStorage;
    private nbList: WinJS.Binding.List<NotebookEntry>;
    private notebooks: NotebookEntry[];
    private sdfjaoir3209fj2ihfio: string;
    private currentData: NotebookData;

    constructor(storage: SkeepStorage) {
        this.storage = storage;
    }

    loadNotebookList(callback: (notebooks: WinJS.Binding.List<NotebookEntry>) => void) {
        storage.listFiles((result: string[]) => {

            this.notebooks = [];
            result.forEach(s => {
                if (s.indexOf(".skeep") > 0)
                    this.notebooks.push(new NotebookEntry(s.replace(".skeep", "")));
            });

            this.nbList = new WinJS.Binding.List<NotebookEntry>(this.notebooks);
            callback(this.nbList);
        });
    }

    loadNotebookData(index: number, password: string): void {

        var fileName: string = this.notebooks[index].name + ".skeep";
        storage.loadFile(fileName, (data: ArrayBuffer) => {

            var all: Uint8Array = new Uint8Array(data);
            var mark: string = new TextDecoder("utf-8").decode(all.subarray(0, 5));
            var ver: number = all.subarray(5, 6)[0];
            
            if (mark != "SKEEP") {
                alert("Invalid file!");
                return;
            }

            var parser: FileFormat;

            switch (ver) {

                case 0: parser = new FileFormatV0(); break;
                case 1: if (ieDetected) parser = new FileFormatV1_IE(); else parser = new FileFormatV1(); break;
                case 2: if (ieDetected) parser = new FileFormatV2_IE(); else parser = new FileFormatV2(); break;
                default:
                    alert("Invalid file version!");
                    return;
            }

            parser.load(this.notebooks[index].name, all, password).then((data: NotebookData) => {
                this.currentData = data;
                this.sdfjaoir3209fj2ihfio = password;
                ui.fillFromNotebook(data);
            }).catch((error: any) => {
                console.log(error);
                ui.showLoadingMessage(false);
                alert("An error has occurred while deciphering your data (wrong password?).");
            });
        });
    }

    createNotebook(name: string, password: string, callback:() => void) {

        storage.exists(name + ".skeep", (exists: boolean) => {

            if (exists)
                alert("A notebook with this name already exists");
            else {

                var nnb: NotebookData = { name: name, entries: null };
                nnb.entries = [{ title: "New note", real: "Insert your text here...", link: null }];

                getDefaultFileFormat().save(nnb, password).then((data) => {
                    storage.saveFile(name + ".skeep", data, (result: boolean) => {
                        if (true) callback();
                    });
                }).catch((err) => {
                    alert(err);
                });
            }
        });
    }

    saveNotebook(data: NotebookDataEntry[], callback: () => void): void {

        this.currentData.entries = data;
        
        getDefaultFileFormat().save(this.currentData, this.sdfjaoir3209fj2ihfio).then((data) => {
            storage.saveFile(this.currentData.name + ".skeep", data, (result: boolean) => {
                if (true)
                    callback();
                else
                    alert("Error while saving...");
            });
        }).catch((err) => {
            alert(err);
        });
    }
}