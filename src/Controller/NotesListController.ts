class NotesListController extends Controller {

    private notesListView: NotesListView;

    public onNoteSelected: () => void;
    public onNoteCreated: () => void;
    public onBackToNotebooks: () => void;

    constructor(domain: Domain, notesListView: NotesListView) {
        super(domain, notesListView);
        this.notesListView = notesListView;
        notesListView.onNoteSelected = (e) => this.noteSelected(e);
        notesListView.onBackClicked = () => this.backClicked();
        notesListView.onAddNote = () => this.addNote();
        notesListView.onStartSearch = () => this.startSearch();
        notesListView.onStopSearch = () => this.stopSearch();
        notesListView.onSearchRequested = (f) => this.search(f);
    }

    public showView(): void {
        this.view.render(this.domain.getCurrentNotebook());
        this.notesListView.selectNote(this.domain.getCurrentNotebook().entries[0]);
        super.showView();
    }

    public refreshSelectedNote(): void {
        this.notesListView.refreshSelectedNote(this.domain.getNoteEntry());
    }

    public startSearch(): void {
        this.notesListView.showSearchBar();
    }

    private noteSelected(e: NotebookEntry): void {
        this.domain.setNoteEntry(e);
        this.onNoteSelected();
    }

    private backClicked(): void {
        this.domain.closeNotebook();
        this.onBackToNotebooks();
    }

    private addNote(): void {
        var entry: NotebookEntry = this.domain.addNote();
        this.notesListView.addNoteEntry(entry);
        this.notesListView.selectNote(entry);
        this.onNoteCreated();
    }

    private search(filter: string): void {
        var toHide = this.domain.getCurrentNotebook().entries.filter((e) => !this.filterMatch(e, filter));
        this.notesListView.resetHidden(this.domain.getCurrentNotebook().entries);
        this.notesListView.hide(toHide);
    }

    private filterMatch(entry: NotebookEntry, filter: string): boolean {
        const f = filter.toLowerCase();
        return (entry.title.toLowerCase().indexOf(f) >= 0)
            || (entry.real.toLowerCase().indexOf(f) >= 0)
            || (entry.link.toLowerCase().indexOf(f) >= 0);
    }

    private stopSearch(): void {
        this.notesListView.hideSearchBar();
        this.notesListView.resetHidden(this.domain.getCurrentNotebook().entries);
    }
}