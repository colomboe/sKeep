///<reference path="View.ts"/>

class NoteView extends View {

    public onBackClicked: () => void;
    public onShowPassword: (password: string) => void;
    public onCopyPassword: (password: string) => void;
    public onStartEditing: () => void;
    public onCancelEditing: () => void;
    public onSaveChanges: () => void;
    public onDeleteNote: () => void;
    public onGeneratePassword: () => void;

    private markdownConverter: any;

    public constructor() {
        super();
        (<any>window).showdown.setOption("simpleLineBreaks", true);
        (<any>window).showdown.setOption("simplifiedAutoLink", false);
        this.markdownConverter = new (<any>window).showdown.Converter();
    }

    protected registerEventHandlers(): void {
        $('#edit-note').click(() => this.onStartEditing());
        $('#cancel-edit').click(() => this.onCancelEditing());
        $('#save-note').click(() => this.onSaveChanges());
        $('#delete-note').click(() => this.onDeleteNote());
        $('#generate-password').click(() => this.onGeneratePassword());
    };

    public show(): void {
        $('.p-note').removeClass('hide-on-small-only');
        $('.p-notes').addClass('hide-on-small-only');
        $('#buttons-view').removeClass('hide-on-small-only');

        if (UI.isMobile())
            $("#top-right-container").addClass("hide");
    }

    public render(entry: NotebookEntry): void {
        this.viewMode();
        $(".p-note .view .header h1").text(entry.title);
        $(".p-note .view .header a").text(entry.link);
        $(".p-note .view p").html(this.format(entry.real));
        this.setupPasswordLinks(entry.real);

        if (UI.isMobile()) {
            $("#back-button").unbind('click');
            $("#back-button").click(() => this.onBackClicked());
        }
    };

    public editNote(entry: NotebookEntry, canCancel: boolean, focusTitle: boolean): void {
        this.editMode();
        $(".p-note .edit .header input").val(entry.title);
        $(".p-note .edit textarea").val(entry.real);

        if (canCancel)
            $("#cancel-edit").removeClass("hide");
        else
            $("#cancel-edit").addClass("hide");

        if (focusTitle)
            $(".p-note .edit .header input").focus().select();
        else
            $(".p-note .edit textarea").focus();

    }

    public editorContent(): NotebookEntry {
        return {
            title: $(".p-note .edit .header input").val(),
            real: $(".p-note .edit textarea").val(),
            link: null
        }
    }

    public insertPassword(password: string): void {
        var content = "$$$" + password + "$$$";
        var editor: HTMLTextAreaElement = <any> $(".p-note .edit textarea")[0];
        editor.focus();
        var startPos = editor.selectionStart;
        var endPos = editor.selectionEnd;
        var original = editor.value;
        editor.value = original.substring(0, startPos)
                        + content
                        + original.substring(endPos, original.length);
        editor.selectionStart = startPos;
        editor.selectionEnd = startPos + content.length;
    }

    public hideCancelButton(): void {
        $("#cancel-edit").addClass("hide");
    }

    private format(text: string): string {
        var prepared: string = text.replace(/(https:\/\/\S+)/g, "<$1>")
                                   .replace(/(http:\/\/\S+)/g, "<$1>")
                                   .replace(/([^\/\n])(www\S+)/g, "$1<$2>");
        return this.markdownConverter.makeHtml(prepared)
            .replace(/<a\s/g, "<a target=\"_blank\" ")
            .replace(/\$\$\$.+?\$\$\$/g, (m: string) =>
                "<a id=\"pwd_" + Utils.sha1hex(m) + "\" href=\"#\">●●●●●●●●●●●●●●●●</a>"
                + " <a id=\"pwd_copy_" + Utils.sha1hex(m) + "\" href=\"#\">[" + Txt.s("COPY_PWD") + "]</a>"
            );
    }

    private setupPasswordLinks(real: string): void {
        var matched = real.match(/\$\$\$.+?\$\$\$/g);
        if (matched !== null) matched.map(p => {
            $("#pwd_" + Utils.sha1hex(p)).click(() => this.onShowPassword(p.replace(/\$\$\$/g, "")));
            $("#pwd_copy_" + Utils.sha1hex(p)).click(() => this.onCopyPassword(p.replace(/\$\$\$/g, "")));
        });
    }

    private editMode(): void {
        $(".p-note > .edit").removeClass("hide");
        $(".p-note > .view").addClass("hide");
        $("#buttons-edit").removeClass("hide");
        $("#buttons-view").addClass("hide");
        $("#cancel-edit").removeClass("hide");
    }

    private viewMode(): void {
        $(".p-note > .view").removeClass("hide");
        $(".p-note > .edit").addClass("hide");
        $("#buttons-view").removeClass("hide");
        $("#buttons-edit").addClass("hide");
    }
}