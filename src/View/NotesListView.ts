class NotesListView extends View {

    public onNoteSelected: (e: NotebookEntry) => void;
    public onBackClicked: () => void;
    public onAddNote: () => void;
    public onStartSearch: () => void;
    public onStopSearch: () => void;
    public onSearchRequested: (filter: string) => void;
    private currentlySelectedElement: JQuery = null;

    protected registerEventHandlers(): void {
        $("#search-button").click(() => this.onStartSearch());
        $("#search-menu").click(() => this.onStartSearch());
        $("#search-close").click(() => this.onStopSearch());
        $("#search-input").keyup(() => this.onSearchRequested($("#search-input").val()));
        $("#search-input").keypress((e) => e.keyCode != this.ENTER_KEY_CODE);
    };

    public show(): void {
        // $outside-app').addClass('hide');
        $('#inside-app').removeClass('hide');
        $('#inside-app').removeClass('slide-out');
        $('#inside-app').addClass('slide-in');
        // (<any>window).Materialize.showStaggeredList('#notes-list');
        $('.p-note').addClass('hide-on-small-only');
        $('.p-notes').removeClass('hide-on-small-only');
        $('#buttons-view').addClass('hide-on-small-only');
        $('#add-note-menu').click(() => this.onAddNote());
        $('#add-note-button').click(() => this.onAddNote());
        $("#top-right-container").removeClass("hide");

        $("#back-button").unbind('click');
        $("#back-button").click(() => this.onBackClicked());
    }

    public render(notebook: Notebook): void {
        $('.brand-logo').text(notebook.name);
        $('#notes-list').html(notebook.entries.map(e => this.renderEntry(e)).join("\n"));
        notebook.entries.forEach(e => this.registerEntryEventHandler(e));
    }

    public selectNote(e: NotebookEntry): void {
        if (this.currentlySelectedElement != null)
            this.currentlySelectedElement.removeClass("selected");
        this.currentlySelectedElement = $("#entry_" + Utils.sha1hex(e.title));
        this.currentlySelectedElement.addClass("selected");
        this.onNoteSelected(e);
    }

    public refreshSelectedNote(entry: NotebookEntry): void {
        var toReplace = $('#notes-list .selected');
        toReplace.replaceWith(this.renderEntry(entry, true));
        this.setEntryVisible(entry);
        this.registerEntryEventHandler(entry);
        this.currentlySelectedElement = $("#entry_" + Utils.sha1hex(entry.title));
    }

    public addNoteEntry(entry: NotebookEntry): void {
        $('#notes-list').append(this.renderEntry(entry));
        this.setEntryVisible(entry);
        this.registerEntryEventHandler(entry);
    }

    public showSearchBar(): void {
        $('#search-bar').removeClass("hide");
        $('#normal-bar').addClass("hide");
        $('#search-input').focus().val("");
    }

    public hideSearchBar(): void {
        $('#search-bar').addClass("hide");
        $('#normal-bar').removeClass("hide");
    }

    public resetHidden(entries: NotebookEntry[]): void {
        entries.forEach(e => $("#entry_" + Utils.sha1hex(e.title)).removeClass("hide"))
    }

    public hide(entries: NotebookEntry[]): void {
        entries.forEach(e => $("#entry_" + Utils.sha1hex(e.title)).addClass("hide"));
    }

    private renderEntry(entry: NotebookEntry, selected: boolean = false): string {
        var selectedClass = selected ? " selected" : "";
        return "<li id=\"entry_"
            + Utils.sha1hex(entry.title)
            + "\" class=\"notes-list-element waves-effect"
            + selectedClass
            + "\"><div><span class=\"title\">"
            + entry.title
            + "</span><span class=\"link\">"
            + entry.link
            + "</span></div></li>";
    }

    private registerEntryEventHandler(entry: NotebookEntry): void {
        $("#entry_" + Utils.sha1hex(entry.title)).click(() => this.selectNote(entry));
    }

    private setEntryVisible(entry: NotebookEntry): void {
        $("#entry_" + Utils.sha1hex(entry.title)).attr("style", "transform: translateX(0px); opacity: 1;");
    }
}