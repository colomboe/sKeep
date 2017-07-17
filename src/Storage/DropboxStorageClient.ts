class DropboxStorageClient implements StorageClient {

    private static key: string = "h0jgf9nop7iztoc";
    private client: Dropbox = null;
    private token: string;

    public async alreadyLogged(): Promise<LoginData> {

        if (this.client == null)
            this.client = new Dropbox({ clientId: DropboxStorageClient.key });

        var urlToken: string = this.getAccessTokenFromUrl();
        if (!!urlToken) {
            this.token = this.getAccessTokenFromUrl();
            var state = this.getStateFromUrl();
            this.client.setAccessToken(this.token);
            var storedState = localStorage.getItem("skeep-state");
            if (state === storedState) {
                localStorage.setItem("skeep-token", this.token);
            }
            else {
                localStorage.removeItem("skeep-state");
                try { await this.client.authTokenRevoke(); } catch (e) { }
                return { logged: false };
            }
        }
        else {
            var storageToken: string = this.getAccessTokenFromStorage();
            if (!!storageToken) {
                this.token = storageToken;
                this.client.setAccessToken(this.token);
            }
        }

        if (this.token != null) {
            try {
                var user = await this.client.usersGetCurrentAccount();
                return { logged: false, email: user.email, name: user.name.display_name };
            }
            catch (e) {
                localStorage.removeItem("skeep-state");
                localStorage.removeItem("skeep-token");
                return { logged: false };
            }
        }
        else
            return { logged: false };
    }

    public login(): void {

        var state: string = "";
        var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (var i = 16; i > 0; --i) state += chars[Math.round(Math.random() * (chars.length - 1))];
        localStorage.setItem("skeep-state", state);
        location.href = this.client.getAuthenticationUrl(location.href.split(/[?#]/)[0], state);
    }

    public async listFiles(): Promise<string[]> {

        var result= await this.client.filesListFolder({
            path: "",
            recursive: false,
            include_media_info: false,
            include_deleted: false,
            include_has_explicit_shared_members: false
        });

        return result.entries.map(e => e.name);
    }

    public async loadFile(fileName: string): Promise<Uint8Array> {

        var metadata = await this.client.filesDownload({ path: "/" + fileName });
        var fileReader = new FileReader();

        return new Promise<Uint8Array>((s,e) => {
            fileReader.onload = function () { s(new Uint8Array(this.result)); };
            fileReader.readAsArrayBuffer(metadata.fileBlob);
        });
    }

    public exists(fileName: string, callback: (exists: boolean) => void): void {

        this.client.filesGetMetadata({ path: "/" + fileName, include_media_info: false, include_deleted: false, include_has_explicit_shared_members: false }).then((data: DropboxSdkJs.FilesFileMetadata): void => {
            callback(true);
        })
        .catch(() => {
            callback(false);
        });

    }

    public async saveFile(fileName: string, data: any): Promise<void> {

        await this.client.filesUpload({ autorename: false, mode: { ".tag": "overwrite" }, path: "/" + fileName, contents: data, mute: false });
    }

    public async logout(): Promise<void> {

        localStorage.removeItem("skeep-state");
        localStorage.removeItem("skeep-token");
        try { await this.client.authTokenRevoke(); } catch (e) { }
        this.token = null;
    }

    private getAccessTokenFromUrl() : string {
        return this.parseQueryString(location.hash).access_token;
    }

    private getStateFromUrl() : string {
        return this.parseQueryString(location.hash).state;
    }

    private getAccessTokenFromStorage() : string {
        return localStorage.getItem("skeep-token");
    }

    private parseQueryString(str: string) : any {
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