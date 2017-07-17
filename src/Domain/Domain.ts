class Domain {

    private storage: StorageClient;
    private fileFormat: FileFormat;
    private notebooks: string[];
    private currentNotebook: Notebook;
    private currentNoteEntry: NotebookEntry;
    private currentPassword: string;

    constructor(storage: StorageClient, fileFormat: FileFormat) {
        this.storage = storage;
        this.fileFormat = fileFormat;
    }

    public async isLogged(): Promise<LoginData> {
        return this.storage.alreadyLogged();
    }

    public doLogin(): void {
        this.storage.login();
    }

    public async doLogout(): Promise<void> {
        await this.storage.logout();
    }

    public async loadNotebooks(): Promise<void> {
        var files: string[] = await this.storage.listFiles();
        this.notebooks = files.map((f) => f.replace(".skeep", ""));
    }

    public getNotebooks(): string[] {
        return this.notebooks.sort((a,b) => a.localeCompare(b));
    }

    public async createNewNotebook(name: string, password: string): Promise<void> {
        var notebook: Notebook = { name: name, entries: [{ title: "New note", real: "Insert your text here...", link: null }] };
	var encoded: Uint8Array = await this.fileFormat.encode(notebook, password);
        await this.storage.saveFile(name + ".skeep", encoded);
        await this.loadNotebooks();
    }

    public async loadNotebook(name: string, password: string): Promise<void> {
        var encoded = await this.storage.loadFile(name + ".skeep");
        this.currentNotebook = await this.fileFormat.decode(name, encoded, password);
        this.populateLinks(this.currentNotebook);
        this.currentPassword = password;
    }

    public getCurrentNotebook(): Notebook {
        return this.currentNotebook;
    }

    public setNoteEntry(entry: NotebookEntry): void {
        this.currentNoteEntry = entry;
    }

    public getNoteEntry(): NotebookEntry {
        return this.currentNoteEntry;
    }

    public closeNotebook(): void {
        this.currentNotebook = null;
        this.currentNoteEntry = null;
        this.currentPassword = null;
    }

    public async updateCurrentEntry(entry: NotebookEntry): Promise<void> {
        this.validateEntry(entry);
        this.currentNoteEntry.real = entry.real;
        this.currentNoteEntry.title = entry.title;
        this.currentNoteEntry.link = Utils.extractLink(entry.real);
        await this.saveCurrentNotebook();
    }

    private async saveCurrentNotebook() {
        var encoded = await this.fileFormat.encode(this.currentNotebook, this.currentPassword);
        await this.storage.saveFile(this.currentNotebook.name + ".skeep", encoded);
    }

    public async deleteCurrentEntry(): Promise<void> {
        if (this.currentNotebook.entries.length == 1) throw "CANT_DELETE_LAST_ENTRY";
        this.currentNotebook.entries = this.currentNotebook.entries.filter(e => (e.title !== this.currentNoteEntry.title));
        await this.saveCurrentNotebook();
    }

    public addNote(): NotebookEntry {
        var title = this.generateUniqueNoteTitle();
        var newNote: NotebookEntry = { title: title, real: Txt.s("NEW_NOTE_CONTENT"), link: null};
        newNote.link = Utils.extractLink(newNote.real);
        this.currentNotebook.entries.push(newNote);
        return newNote;
    }

    public updateLoginStats(loginData: LoginData) {
        
    }

    private generateUniqueNoteTitle() {
        var counter: number = 1;
        var title: string;
        do title = this.generateNewNoteTitle(counter++); while(!this.isTitleUnique(title));
        return title;
    }

    private populateLinks(notebook: Notebook): void {
        notebook.entries.forEach(e => e.link = Utils.extractLink(e.real));
    }

    private validateEntry(entry: NotebookEntry): void {
        if (entry.title === "") throw "VALIDATION_EMPTY_TITLE";
        if (!this.isTitleUnique(entry.title, this.currentNoteEntry.title)) throw "VALIDATION_TITLE_NOT_UNIQUE";
    }

    private isTitleUnique(newTitle: string, oldTitle: string = null): boolean {
        return this.currentNotebook.entries.filter(e => ((e.title !== oldTitle) && (e.title === newTitle))).length == 0;
    }

    private generateNewNoteTitle(counter: number): string {
        return Txt.s("NEW_NOTE_TITLE") + ((counter > 1) ? " " + counter : "");
    }

}
