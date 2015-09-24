/// <reference path="../typings/dropboxjs.d.ts" />
/// <reference path="skeepstorage.ts" />

class SkeepDropbox implements SkeepStorage {

    private static key: Dropbox.Credentials = { key: "" };
    private client: Dropbox.Client = null;
    
    init(callback: (result: boolean) => void) {
        if (this.client == null)
            this.client = new Dropbox.Client(SkeepDropbox.key);
        this.client.reset();
        var opt: Dropbox.AuthenticateOptions = {
            interactive: false
        };
        
        this.client.authenticate({ interactive: false }, (err: Dropbox.ApiError|Dropbox.AuthError, client: Dropbox.Client): void => {
            callback(client.isAuthenticated());
        });
    }

    login(callback: (result: boolean) => void) {
        
        this.client.reset();
        if (!this.client.isAuthenticated()) {
            this.client.authenticate((err: Dropbox.ApiError|Dropbox.AuthError, client: Dropbox.Client): void => {
                if (err != null) {
                    if (err instanceof Dropbox.ApiError)
                        console.log(err.status + " - " + err.responseText);
                    else if (err instanceof Dropbox.AuthError) {
                        console.log(err.code + " - " + err.description);
                    }
                    callback(false);
                }
                else
                    callback(true);
            });
        }
        else
            callback(true);
    }

    listFiles(callback: (result: string[]) => void): void {

        this.client.readdir(".", (err: Dropbox.ApiError, filenames: string[], stat: Dropbox.File.Stat, folderEntries: Dropbox.File.Stat[]): void => {
            if (err != null)
                alert(err.status + " - " + err.response);
            else
                callback(filenames);
        });
    }

    loadFile(fileName: string, callback: (data: ArrayBuffer) => void): void {

        this.client.readFile(fileName, { arrayBuffer: true }, (err: Dropbox.ApiError, fileContents: any): void => {
            if (err != null)
                alert(err.status + " - " + err.response);
            else
                callback(<ArrayBuffer> fileContents);
        });
    }

    exists(fileName: string, callback: (exists: boolean) => void): void {

        this.client.stat(fileName, (err, stat) => {

            callback((!err) && (stat.isRemoved == false));
        });
    }

    saveFile(fileName: string, data: any, callback: (result: boolean) => void): void {

        this.client.writeFile(fileName, data, (err, stat) => {

            if (err) console.log(err);
            callback(!err);
        });
    }

    logout(callback: () => void): void {

        this.client.signOut((err: Dropbox.ApiError) => {
            if (err) console.log(err);
            callback();
        });
    }
}