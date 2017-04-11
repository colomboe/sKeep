class UI {

    domain: Domain;
    state: UIState;
    loginController: LoginController;
    loadingNotebooksController: LoadingNotebooksController;
    notebooksListController: NotebooksListController;
    notesListController: NotesListController;
    noteController: NoteController;

    constructor(domain: Domain) {
        this.domain = domain;
        this.loginController = new LoginController(domain, new LoginView());
        this.loadingNotebooksController = new LoadingNotebooksController(domain, new LoadingNotebooksView());
        this.notebooksListController = new NotebooksListController(domain, new NotebooksListView());
        this.notesListController = new NotesListController(domain, new NotesListView());
        this.noteController = new NoteController(domain, new NoteView());

        (<any>$('.modal')).modal();
        this.registerEventHandlers();
    }

    private registerEventHandlers() {
        this.notebooksListController.onLogout = () => this.setState(UIState.LOGIN);
        this.notebooksListController.onNotebookSelected = () => this.setState(UIState.NOTES_LIST);
        this.notesListController.onNoteSelected = () => this.setState(UIState.NOTE);
        this.notesListController.onBackToNotebooks = () => this.setState(UIState.NOTEBOOKS_LIST);
        this.notesListController.onNoteCreated = () => this.noteController.editNewNote();
        this.noteController.onBackToNotes = () => this.setState(UIState.NOTES_LIST);
        this.noteController.onStartEditing = () => this.stopSearchOnKeyPressed();
        this.noteController.onStopEditing = () => this.startSearchOnKeyPressed();
        this.noteController.onCurrentNoteModified = () => this.notesListController.refreshSelectedNote();
        this.noteController.onCurrentNoteDeleted = () => this.setState(UIState.NOTES_LIST);
    }

    public async setState(state: UIState): Promise<void> {
        this.state = state;
        this.stopSearchOnKeyPressed();

        switch (state) {
            case UIState.LOGIN:
                this.loginController.showView();
                break;
            case UIState.LOADING_NOTEBOOKS:
                this.loadingNotebooksController.showView();
                await this.domain.loadNotebooks();
                await this.setState(UIState.NOTEBOOKS_LIST);
                break;
            case UIState.NOTEBOOKS_LIST:
                this.notebooksListController.showView();
                break;
            case UIState.NOTES_LIST:
                this.notesListController.showView();
                this.startSearchOnKeyPressed();
                break;
            case UIState.NOTE:
                this.noteController.showView();
                if (!UI.isMobile()) this.startSearchOnKeyPressed();
                break;
        }
    }

    private startSearchOnKeyPressed(): void {
        $(document).keydown(e => {
            if ((e.target.nodeName.toLowerCase() !== 'input')
                && (e.target.nodeName.toLowerCase() !== 'textarea')
                && ($('.p-note').css('display') != 'none')
                && $('#search-bar').hasClass("hide")) {
                this.notesListController.startSearch();
            }
        });
    }

    private stopSearchOnKeyPressed(): void {
        $(document).unbind('keydown');
    }

    public static isMobile(): boolean {
        return $("#modeIndicator").css("z-index") === "2";
    }
}