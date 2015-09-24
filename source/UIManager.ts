const enum ScreenMode { Standard = 1, Mobile = 2, Extended = 3 };

class UIManager {
    
    public onLoginButtonClicked: () => void;
    public onNotebookSelected: (index: number, password: string) => void;
    public onCreateNotebook: (name: string, password: string) => void;
    public onSaveNotebook: (data: NotebookDataEntry[]) => void;
    public onLogout: () => void;

    private notesData: WinJS.Binding.List<NotebookDataEntry>;
    private selected: NotebookDataEntry;
    
    private welcomePane: HTMLElement;
    private progressRing: HTMLElement;
    private cmdLogin: HTMLButtonElement;
    private splitViewButton: WinJS.UI.SplitViewPaneToggle;
    private splitView: WinJS.UI.SplitView;
    private notebookListView: WinJS.UI.ListView<NotebookEntry>;
    private labelTitle: HTMLElement;
    private labelNotebookTitle: HTMLElement;
    private notebookListPane: HTMLElement;
    private notesPane: HTMLElement;
    private noteListView: WinJS.UI.ListView<NotebookDataEntry>;
    private titleLabel: HTMLElement;
    private linkLabel: HTMLElement;
    private bodyLabel: HTMLElement;
    private searchBox: WinJS.UI.SearchBox;
    private noteToolbar: WinJS.UI.ToolBar;
    private noteToolbarEdit: WinJS.UI.ToolBar;
    private cmdBack: HTMLButtonElement;
    private cmdNotebookList: WinJS.UI.NavBarCommand;
    private cmdNotesList: WinJS.UI.NavBarCommand;
    private cmdAbout: WinJS.UI.NavBarCommand;
    private cmdLogout: WinJS.UI.NavBarCommand;
    private cmdEdit: HTMLButtonElement;
    private cmdDelete: HTMLButtonElement;
    private loadingDialog: WinJS.UI.ContentDialog;
    private deleteConfirmDialog: WinJS.UI.ContentDialog;
    private showPasswordDialog: WinJS.UI.ContentDialog;
    private newNotebookDialog: WinJS.UI.ContentDialog;
    private openNotebookDialog: WinJS.UI.ContentDialog;
    private aboutDialog: WinJS.UI.ContentDialog;
    private noteHeader: HTMLElement;
    private noteHeaderEdit: HTMLElement;
    private noteBody: HTMLElement;
    private noteBodyEdit: HTMLElement;
    private titleText: HTMLInputElement;
    private bodyText: HTMLTextAreaElement;
    private cmdGenerate: HTMLElement;
    private cmdSave: HTMLElement;
    private cmdCancel: HTMLElement;
    private cmdAdd: HTMLElement;
    private passwordShowText: HTMLInputElement;
    private notesViewPane: HTMLElement;
    private openNotebookPasswordText: HTMLInputElement;

    constructor() {
        this.welcomePane = document.getElementById("welcomePane");
        this.labelTitle = document.getElementById("labelTitle");
        this.labelNotebookTitle = document.getElementById("labelNotebookTitle");
        this.progressRing = document.getElementById("progressRing");
        this.cmdLogin = <HTMLButtonElement> document.getElementById("cmdLogin");
        this.splitViewButton = <WinJS.UI.SplitViewPaneToggle> document.getElementById("splitViewButton").winControl;
        this.splitView = <WinJS.UI.SplitView> document.getElementById("mainSplitView").winControl;
        this.notebookListView = <WinJS.UI.ListView<NotebookEntry>> document.getElementById("notebookListView").winControl
        this.notebookListPane = document.getElementById("notebookListPane");
        this.notesPane = document.getElementById("notesPane");
        this.noteListView = <WinJS.UI.ListView<NotebookDataEntry>> document.getElementById("noteListView").winControl
        this.titleLabel = document.getElementById("titleLabel");
        this.linkLabel = document.getElementById("linkLabel");
        this.bodyLabel = document.getElementById("noteBody");
        this.searchBox = <WinJS.UI.SearchBox> document.getElementById("searchBoxBox").winControl;
        this.noteToolbar = <WinJS.UI.ToolBar> document.getElementById("noteToolbar").winControl;
        this.noteToolbarEdit = <WinJS.UI.ToolBar> document.getElementById("noteToolbarEdit").winControl;
        this.cmdBack = <HTMLButtonElement> document.getElementById("cmdBack");
        this.cmdNotebookList = <WinJS.UI.NavBarCommand> document.getElementById("cmdNotebookList").winControl;
        this.cmdNotesList = <WinJS.UI.NavBarCommand> document.getElementById("cmdNotesList").winControl;
        this.cmdLogout = <WinJS.UI.NavBarCommand> document.getElementById("cmdLogout").winControl;
        this.cmdAbout = <WinJS.UI.NavBarCommand> document.getElementById("cmdAbout").winControl;
        this.cmdEdit = <HTMLButtonElement> document.getElementById("cmdEdit");
        this.cmdDelete = <HTMLButtonElement> document.getElementById("cmdDelete");
        this.loadingDialog = <WinJS.UI.ContentDialog> document.getElementById("loadingDialog").winControl;
        this.deleteConfirmDialog = <WinJS.UI.ContentDialog> document.getElementById("deleteConfirmDialog").winControl;
        this.showPasswordDialog = <WinJS.UI.ContentDialog> document.getElementById("showPasswordDialog").winControl;
        this.newNotebookDialog = <WinJS.UI.ContentDialog> document.getElementById("newNotebookDialog").winControl;
        this.openNotebookDialog = <WinJS.UI.ContentDialog> document.getElementById("openNotebookDialog").winControl;
        this.aboutDialog = <WinJS.UI.ContentDialog> document.getElementById("aboutDialog").winControl;
        this.noteHeader = document.getElementById("noteHeader");
        this.noteHeaderEdit = document.getElementById("noteHeaderEdit");
        this.noteBody = document.getElementById("noteBody");
        this.noteBodyEdit = document.getElementById("noteBodyEdit");
        this.titleText = <HTMLInputElement> document.getElementById("titleText");
        this.bodyText = <HTMLTextAreaElement> document.getElementById("bodyText");
        this.cmdGenerate = document.getElementById("cmdGenerate");
        this.cmdSave = document.getElementById("cmdSave");
        this.cmdCancel = document.getElementById("cmdCancel");
        this.cmdAdd = document.getElementById("cmdAdd");
        this.passwordShowText = <HTMLInputElement> document.getElementById("passwordShowText");
        this.notesViewPane = document.getElementById("notesViewPane");
        this.openNotebookPasswordText = <HTMLInputElement> document.getElementById("openNotebookPasswordText");
        
        this.processScreenModeSetup();

        this.splitViewButton.addEventListener("invoked", ev => { this.notebookListView.forceLayout(); });
        this.cmdLogin.addEventListener("click", ev => { this.onLoginButtonClicked() });
        this.notebookListView.addEventListener("iteminvoked", ev => { this.startOpenProcedure(ev.detail.itemIndex); });
        this.noteListView.addEventListener("iteminvoked", ev => { this.updateSelectedNote(); });
        this.searchBox.addEventListener("querychanged", ev => { this.updateSearchResult(ev.detail.queryText.toLowerCase()); });
        this.cmdNotebookList.addEventListener("click", ev => { this.showNotebookListPane(); });
        this.cmdNotesList.addEventListener("click", ev => { this.showNotesPane(); });
        this.cmdAbout.addEventListener("click", ev => { this.aboutDialog.show(); });
        this.cmdEdit.addEventListener("click", ev => { this.startEditing(); });
        this.cmdDelete.addEventListener("click", ev => { this.deleteNote(); });
        this.cmdCancel.addEventListener("click", ev => { this.closeEditing(); });
        this.cmdSave.addEventListener("click", ev => { this.saveEditing(); });
        this.cmdGenerate.addEventListener("click", ev => { this.generatePassword(); });
        this.cmdAdd.addEventListener("click", ev => { this.handleAdd(); });
        this.cmdBack.addEventListener("click", ev => { this.backToNotesListPane(); });
        this.cmdLogout.addEventListener("click", ev => { this.onLogout(); });
        this.openNotebookPasswordText.addEventListener("keyup", ev => {
            if (ev.keyCode == 13) this.openNotebookDialog.hide(WinJS.UI.ContentDialog.DismissalResult.primary);
        })
    }

    processScreenModeSetup(): void {

        switch (this.getScreenMode()) {

            case ScreenMode.Standard:
                this.splitView.closedDisplayMode = WinJS.UI.SplitView.ClosedDisplayMode.inline;
                this.splitView.openedDisplayMode = WinJS.UI.SplitView.OpenedDisplayMode.overlay;
                break;
            case ScreenMode.Mobile:
                this.splitView.closedDisplayMode = WinJS.UI.SplitView.ClosedDisplayMode.none;
                this.splitView.openedDisplayMode = WinJS.UI.SplitView.OpenedDisplayMode.overlay;
                break;
            case ScreenMode.Extended:
                this.splitView.closedDisplayMode = WinJS.UI.SplitView.ClosedDisplayMode.inline;
                this.splitView.openedDisplayMode = WinJS.UI.SplitView.OpenedDisplayMode.inline;
                setTimeout(() => { this.splitView.openPane(); this.notebookListView.forceLayout(); }, 1);
                break;
        }
    }

    getScreenMode(): ScreenMode {
        var state = parseInt(window.getComputedStyle(document.getElementById("modeIndicator")).getPropertyValue('z-index'), 10);
        return <ScreenMode> state;
    }

    showLoginButton(): void {
        this.cmdLogin.style.display = "inline";
        this.progressRing.style.display = "none";
    }

    showProgressRing(): void {
        this.cmdLogin.style.display = "none";
        this.progressRing.style.display = "inline";
    }

    setNotebookList(data: WinJS.Binding.List<NotebookEntry>): void {
        
        this.notebookListView.itemDataSource = data.dataSource;
        this.welcomePane.style.top = "-100%";
    }

    extractLink(entry: NotebookDataEntry): void {

        entry.link = "";
        var m = entry.real.match(/(https:\/\/\S+)/g);
        if (m != null) { entry.link = m[0]; return; }
        m = entry.real.match(/(http:\/\/\S+)/g);
        if (m != null) { entry.link = m[0]; return; }
        m = /[^\/\n]?(www\S+)/g.exec(entry.real);
        if (m != null) { entry.link = m[1]; return; }
    }

    fillFromNotebook(data: NotebookData): void {

        data.entries.forEach((e) => this.extractLink(e));

        this.notesData = new WinJS.Binding.List<NotebookDataEntry>([]);
        data.entries.forEach(e => this.notesData.push(WinJS.Binding.as(e)));

        this.labelNotebookTitle.innerHTML = data.name;
        this.showNotesPane();
        
        this.noteListView.itemDataSource = this.notesData.dataSource;
        this.noteListView.selection.set(0);
        this.updateSelectedNote();

        if (this.getScreenMode() == ScreenMode.Mobile) this.backToNotesListPane();
    }

    updateSelectedNote(): Promise<NotebookDataEntry> {
        if (this.noteListView.selection.count() == 0) return;
        this.closeEditing();

        return new Promise((resolve, reject) => {

            this.noteListView.selection.getItems().then(is => {

                this.selected = is[0].data;

                this.titleLabel.innerHTML = this.selected.title;

                if (this.selected.link !== "") {
                    var simepleLink = this.selected.link.replace(/^https?\:\/\//, "").replace(/\/$/, "");
                    var realLink = this.selected.link.substr(0, 4) == "http" ? this.selected.link : "http://" + this.selected.link;
                    this.linkLabel.innerHTML = "<a target=\"_blank\" href=\"" + realLink + "\">" + simepleLink + "</a>";
                }
                else
                    this.linkLabel.innerHTML = "-";
                this.bodyLabel.innerHTML = this.formatBodyText(this.selected.real);

                WinJS.UI.Animation.enterContent(this.titleLabel, null);
                WinJS.UI.Animation.enterContent(this.linkLabel, null);
                WinJS.UI.Animation.enterContent(this.bodyLabel, null);

                this.refreshNoteToolbar();

                this.notesViewPane.style.display = "";
                this.loadingDialog.hide();
                resolve(this.selected);
            });
        });
    }

    refreshNoteToolbar(): void {

        if (this.getScreenMode() == ScreenMode.Mobile) {

            if (!ieDetected) this.cmdBack.style.marginRight = null;
            this.noteToolbar.forceLayout();
            if (!ieDetected) this.cmdBack.style.marginRight = "auto";
        }
        else {

            this.noteToolbar.forceLayout();
            this.cmdBack.style.display = "none";
        }

    }

    formatBodyText(body: string): string {

        body = body.replace(/\$\$\$.+?\$\$\$/g, (m) => {
            var bp = btoa(encodeURIComponent(m));
            return "<a href=\"#\" onclick=\"ui.showPassword('" + bp + "');\">●●●●●●●●●●●●●●●●</a>";
        });

        body = body.replace(/(https:\/\/\S+)/g, "<a href=\"$1\" target=\"_blank\">$1</a>");
        body = body.replace(/(http:\/\/\S+)/g, "<a href=\"$1\" target=\"_blank\">$1</a>");
        body = body.replace(/([^\/\n])(www\S+)/g, "$1<a href=\"http://$2\" target=\"_blank\">$2</a>");
        body = body.replace(/\n/g, '<br>');
        return body;
    }

    updateSearchResult(query: string): void {

        if (query == "")
            this.noteListView.itemDataSource = this.notesData.dataSource;
        else {
            var filtered = this.notesData.createFiltered(i => {
                return ((i.title.toLowerCase().indexOf(query) >= 0)
                    || (i.real.toLowerCase().indexOf(query) >= 0));
            });
            this.noteListView.itemDataSource = filtered.dataSource;
        }
    };

    showNotesPane(): void {

        if (this.notesData == null) {

            alert("Please choose a notebook before switching to the notes and passwords view.");
            return;
        }

        this.labelTitle.style.display = "none";
        this.labelNotebookTitle.style.display = "";
        this.notesPane.style.display = "";
        this.notebookListPane.style.display = "none";
    }

    showNotebookListPane(): void {

        this.labelTitle.style.display = "";
        this.labelNotebookTitle.style.display = "none";
        this.notesPane.style.display = "none";
        this.notebookListPane.style.display = "";
    }

    showLoadingMessage(show: boolean = true): void {

        if (show)
            this.loadingDialog.show();
        else
            this.loadingDialog.hide();
    }

    startEditing(): void {

        this.searchBox.focusOnKeyboardInput = false;
        this.noteHeader.style.display = "none";
        this.noteHeaderEdit.style.display = "";
        this.noteBody.style.display = "none";
        this.noteBodyEdit.style.display = "";
        this.titleText.value = this.selected.title;
        this.bodyText.value = this.selected.real;
        this.bodyText.focus();
        this.noteToolbar.element.style.display = "none";
        this.noteToolbarEdit.element.style.display = "";
        this.noteToolbarEdit.forceLayout();
    };

    deleteNote(): void {

        if (this.notesData.length <= 1) {
            alert("At least one note must exist inside a notebook.");
            return;
        }

        this.deleteConfirmDialog.show().then((info) => {
            if (info.result === "secondary") {
                var indicesList = this.noteListView.selection.getIndices().sort(function (a, b) { return a - b });
                for (var j = indicesList.length - 1; j >= 0; j--) this.notesData.splice(indicesList[j], 1);
                this.noteListView.selection.set(0);
                setTimeout(() => { this.updateSelectedNote().then(() => this.save()); }, 1);
            }
        });	
    }

    closeEditing(): void {

        this.searchBox.focusOnKeyboardInput = true;
        this.noteHeader.style.display = "";
        this.noteHeaderEdit.style.display = "none";
        this.noteBody.style.display = "";
        this.noteBodyEdit.style.display = "none";
        this.noteToolbar.element.style.display = "";
        this.noteToolbarEdit.element.style.display = "none";
        this.refreshNoteToolbar();
    }

    saveEditing(): void {

        this.selected.title = this.titleText.value;
        this.selected.real = this.bodyText.value;
        this.extractLink(this.selected);
        this.updateSelectedNote().then(() => this.save());
    }

    save(): void {

        var newList: NotebookDataEntry[] = [];
        for (var i = 0; i < this.notesData.length; i++) {
            var note = this.notesData.getAt(i);
            var newNote: NotebookDataEntry = { title: note.title, real: note.real, link: null };
            newList.push(newNote);
        }

        this.onSaveNotebook(newList);
    }

    generatePassword(): void {

        this.bodyText.focus();

        var newPassword = '$$$';
        var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@#!';
        for (var i = 16; i > 0; --i) newPassword += chars[Math.round(Math.random() * (chars.length - 1))];
        newPassword += "$$$";

        var startPos = this.bodyText.selectionStart;
        var endPos = this.bodyText.selectionEnd;
        var original = this.bodyText.value;
        this.bodyText.value = original.substring(0, startPos)
                            + newPassword
                            + original.substring(endPos, original.length);
        this.bodyText.selectionStart = startPos;
        this.bodyText.selectionEnd = startPos + newPassword.length;
    }

    handleAdd(): void {

        if (this.notebookListPane.style.display == "") {

            this.newNotebookDialog.show().then((info) => {

                if (info.result === "primary") {

                    var createNotebookNameText = <HTMLInputElement> document.getElementById("createNotebookNameText");
                    var createNotebookPasswordText = <HTMLInputElement> document.getElementById("createNotebookPasswordText");
                    var createNotebookPasswordRepeatText = <HTMLInputElement> document.getElementById("createNotebookPasswordRepeatText");

                    var name = createNotebookNameText.value;
                    var pwd = createNotebookPasswordText.value;
                    var pwdRepeat = createNotebookPasswordRepeatText.value;

                    createNotebookPasswordText.value = "";
                    createNotebookPasswordRepeatText.value = "";

                    if (pwd !== pwdRepeat) {
                        alert("The two passwords provided differ. Please retry.")
                        return;
                    }

                    if ((name != null) && (pwd != null)) {

                        createNotebookNameText.value = "";
                        this.onCreateNotebook(name, pwd);
                    }
                }
            });
        }
        else {

            var newEntry: NotebookDataEntry = { real: "Insert your text here...", title: "New note", link: "" };
            this.notesData.push(WinJS.Binding.as(newEntry));
            this.noteListView.selection.set(this.notesData.length - 1).then(() => {
                this.updateSelectedNote().then((s: NotebookDataEntry) => {
                    this.startEditing();
                    this.titleText.focus();
                    this.titleText.setSelectionRange(0, this.titleText.value.length);
                });
            });
        }
    }

    showPassword(bp: string) {

        var pwd = decodeURIComponent(atob(bp));
        this.passwordShowText.value = pwd.substr(3, pwd.length - 6);
        this.showPasswordDialog.show().then(ev => {
            this.passwordShowText.focus();
        });
    }

    backToNotesListPane(): void {

        this.notesViewPane.style.display = "none";
    }

    startOpenProcedure(index: number): void {
        
        this.openNotebookDialog.show().then((info) => {
            if (info.result === "primary") {
                var p = this.openNotebookPasswordText.value;
                this.openNotebookPasswordText.value = "";
                this.onNotebookSelected(index, p);
            }
        });
    }
    
}