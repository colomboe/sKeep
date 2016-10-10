/// <reference path="../typings/dropbox-sdk-js.ts" />
/// <reference path="skeepstorage.ts" />

class SkeepDropbox implements SkeepStorage {

    private static key: string = "h0jgf9nop7iztoc";
    private client: Dropbox = null;
    private token: string;
    
    getAccessTokenFromUrl() : string {
        return this.parseQueryString(window.location.hash).access_token;
    }
    
    getStateFromUrl() : string {
        return this.parseQueryString(window.location.hash).state;
    }

    getAccessTokenFromStorage() : string {
        return window.localStorage.getItem("skeep-token");
    }
    
    init(callback: (result: boolean) => void) {
        
        if (this.client == null)
            this.client = new Dropbox({ clientId: SkeepDropbox.key });

        var urlToken = this.getAccessTokenFromUrl();
        var storageToken = this.getAccessTokenFromStorage();     
        if (!!urlToken) {
            this.token = this.getAccessTokenFromUrl();
            var state = this.getStateFromUrl();
            this.client.setAccessToken(this.token);
            var storedState = window.localStorage.getItem("skeep-state");
            if (state === storedState) {
                window.localStorage.setItem("skeep-token", this.token);
            }
            else {
                window.localStorage.removeItem("skeep-state");
                this.client.authTokenRevoke(this.token);
                callback(false);
            }
        }
        else if (!!storageToken) {
            this.token = storageToken;
            this.client.setAccessToken(this.token);
        }
        
        callback(this.token != null);
    }

    login(callback: (result: boolean) => void) {
        
        var state: string = "";
        var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (var i = 16; i > 0; --i) state += chars[Math.round(Math.random() * (chars.length - 1))];
        window.localStorage.setItem("skeep-state", state);
        window.location.href = this.client.getAuthenticationUrl(window.location.href, state);
    }

    listFiles(callback: (result: string[]) => void): void {

        this.client.filesListFolder({ path: "", recursive: false, include_media_info: false, include_deleted: false, include_has_explicit_shared_members: false })
            .then((res: DropboxSdkJs.FilesListFolderResult): void => {
                var names: string[] = new Array();
                for (var i = 0; i < res.entries.length; i++) {
                    var e = res.entries[i];
                    names.push(e.name);
                }
                callback(names);
            });
    }

    loadFile(fileName: string, callback: (data: ArrayBuffer) => void): void {

        this.client.filesDownload({ path: "/" + fileName }).then((data: DropboxSdkJs.FilesFileMetadata): void => {
                
                var fileReader = new FileReader();
                fileReader.onload = function() {
                    callback(this.result);
                };
                fileReader.readAsArrayBuffer(data.fileBlob);
            }
        );
    }

    exists(fileName: string, callback: (exists: boolean) => void): void {

        this.client.filesGetMetadata({ path: "/" + fileName, include_media_info: false, include_deleted: false, include_has_explicit_shared_members: false }).then((data: DropboxSdkJs.FilesFileMetadata): void => {
            callback(true);
        })
        .catch(() => {
            callback(false);
        });

    }

    saveFile(fileName: string, data: any, callback: (result: boolean) => void): void {

        this.client.filesUpload({ autorename: false, mode: { ".tag": "overwrite" }, path: "/" + fileName, contents: data, mute: false })
        .then(() => { callback(true); })
        .catch(() => { callback(false); });
    }

    logout(callback: () => void): void {

        window.localStorage.removeItem("skeep-state");
        this.client.authTokenRevoke(this.token).then(() => { callback(); })
        this.token = null;
    }
    
    parseQueryString(str: string) : any {
      var ret = Object.create(null);

      if (typeof str !== 'string') {
        return ret;
      }

      str = str.trim().replace(/^(\?|#|&)/, '');

      if (!str) {
        return ret;
      }

      str.split('&').forEach(function (param) {
        var parts = param.replace(/\+/g, ' ').split('=');
        // Firefox (pre 40) decodes `%3D` to `=`
        // https://github.com/sindresorhus/query-string/pull/37
        var key = parts.shift();
        var val = parts.length > 0 ? parts.join('=') : undefined;

        key = decodeURIComponent(key);

        // missing `=` should be `null`:
        // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
        val = val === undefined ? null : decodeURIComponent(val);

        if (ret[key] === undefined) {
          ret[key] = val;
        } else if (Array.isArray(ret[key])) {
          ret[key].push(val);
        } else {
          ret[key] = [ret[key], val];
        }
      });

      return ret;
    }
}