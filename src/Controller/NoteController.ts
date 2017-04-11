class NoteController extends Controller {

    private noteView: NoteView;

    public onBackToNotes: () => void;
    public onStartEditing: () => void;
    public onStopEditing: () => void;
    public onCurrentNoteModified: () => void;
    public onCurrentNoteDeleted: () => void;

    constructor(domain: Domain, noteView: NoteView) {
        super(domain, noteView);
        this.noteView = noteView;
        noteView.onBackClicked = () => this.onBackToNotes();
        noteView.onShowPassword = (p: string) => this.showPassword(p);
        noteView.onCopyPassword = (p: string) => this.copyPassword(p);
        noteView.onStartEditing = () => this.startEditing();
        noteView.onCancelEditing = () => this.cancelEditing();
        noteView.onSaveChanges = () => this.saveChanges();
        noteView.onDeleteNote = () => this.deleteNote();
        noteView.onGeneratePassword = () => this.generatePassword();
    }

    public showView(): void {
        this.view.render(this.domain.getNoteEntry());
        super.showView();
    }

    public editNewNote(): void {
        this.startEditing(true);
    }

    private showPassword(password: string): void {
        this.view.showForCopy(Txt.s("VIEW_PASSWORD_TITLE"), Txt.s("VIEW_PASSWORD_TEXT"), password);
    }

    private copyPassword(password: string): void {
        Utils.toClipboard(password);
        (<any>window).Materialize.toast('Copied to clipboard!', 4000);
    }

    private startEditing(newNote: boolean = false): void {
        this.noteView.editNote(this.domain.getNoteEntry(), !newNote, newNote);
        this.onStartEditing();
    }

    private cancelEditing(): void {
        this.noteView.render(this.domain.getNoteEntry());
        this.onStopEditing();
    }

    private async saveChanges(): Promise<void> {
        this.view.showWaiting();
        try {
            await this.domain.updateCurrentEntry(this.noteView.editorContent());
            this.noteView.render(this.domain.getNoteEntry());
            this.onCurrentNoteModified();
        }
        catch(e) {
            console.log(e);
            this.view.showMessage(Txt.s("ERROR"), Txt.s(e));
        }
        finally {
            this.view.hideWaiting();
            this.onStopEditing();
        }
    }

    private async deleteNote(): Promise<void> {
        this.view.showWaiting();
        try {
            await this.domain.deleteCurrentEntry();
            this.onCurrentNoteDeleted();
        }
        catch(e) {
            console.log(e);
            this.view.showMessage(Txt.s("ERROR"), Txt.s(e));
        }
        finally {
            this.view.hideWaiting();
            this.onStopEditing();
        }
    }

    private generatePassword(): void {
        var password = Utils.randomPassword(16);
        this.noteView.insertPassword(password);
    }
}