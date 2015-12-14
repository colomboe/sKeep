/// <reference path="../typings/winjs.d.ts" />
/// <reference path="SkeepDropbox.ts" />
/// <reference path="SkeepNotebookManager.ts" />
/// <reference path="UIManager.ts" />
/// <reference path="SkeepFakeStorage.ts" />
/// <reference path="FileFormatLib.ts" />
/// <reference path="FileFormatLib_IE.ts" />

var storage: SkeepStorage = new SkeepDropbox();
// var storage: SkeepStorage = new SkeepFakeStorage();
var manager: SkeepNotebookManager = new SkeepNotebookManager(storage);
var ui: UIManager;

function getDefaultFileFormat(): FileFormat {

    if (ieDetected)
        return new FileFormatV2_IE();
    else
        return new FileFormatV2();
}

var ieDetected = true
if (typeof document.documentMode === "undefined") {
    ieDetected = false;
}

document.addEventListener("DOMContentLoaded", () => {

    WinJS.UI.processAll().done(function () {

        ui = new UIManager();
        ui.showProgressRing();

        storage.init((result: boolean) => {
            if (result == true) {
                manager.loadNotebookList((notebooks) => {
                    ui.setNotebookList(notebooks);
                });
            }
            else
                ui.showLoginButton();
        });

        ui.onLoginButtonClicked = () => {
            storage.login((result: boolean) => {
                if (result == true) {
                    manager.loadNotebookList((notebooks) => {
                        ui.setNotebookList(notebooks);
                    });
                }
            });
        };

        ui.onNotebookSelected = (index: number, password: string) => {
            ui.showLoadingMessage();
            manager.loadNotebookData(index, password);
        }

        ui.onCreateNotebook = (name: string, password: string) => {
            ui.showLoadingMessage();
            manager.createNotebook(name, password, () => {
                manager.loadNotebookList((notebooks) => {
                    ui.setNotebookList(notebooks);
                    ui.showLoadingMessage(false);
                });
            });
        }

        ui.onSaveNotebook = (data: NotebookDataEntry[]) => {
            ui.showLoadingMessage();
            manager.saveNotebook(data, () => {
                ui.showLoadingMessage(false);
            });
        }

        ui.onLogout = () => {

            storage.logout(() => {
                window.location.reload();
            });
        }
    });
});
