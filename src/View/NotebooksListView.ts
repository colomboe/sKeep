///<reference path="View.ts"/>

interface NewNotebookValidationResult {
    nameValid: boolean;
    passwordValid: boolean;
    confirmValid: boolean;
    dialogAction: "CLOSE" | "OPEN";
}

class NotebooksListView extends View {

    private openingNotebookName: string;

    public onLogoutRequest: () => void;
    public onNotebookCreate: (name: string, password: string, confirm: string) => Promise<NewNotebookValidationResult>;
    public onNotebookSelected: (name: string, password: string) => void;

    protected registerEventHandlers(): void {
        // public
        $('#logout-button').click(() => this.onLogoutRequest());
        // internal
        $('#new-notebook').click(() => this.showNewNotebookDialog());
        $('#new-notebook-create').click(() => this.notebookCreate());
        $('#notebook-open').click(() => this.notebookOpen());
        $('#open-notebook-password').keydown(async (e) => { if (e.keyCode == this.ENTER_KEY_CODE) await this.notebookOpen(); });
    }

    public show(): void {
        // $('#outside-app').removeClass('hide');
        // $('#inside-app').addClass('hide');
        $('#inside-app').removeClass('slide-in');
        $('#inside-app').addClass('slide-out');
        $('.login-to-header').addClass('login-to-header-stage2')
        $('#login-button').removeClass('visible')
        $('#logout-button').addClass('visible')
        $('.login-to-header .spinner').removeClass('visible');
        $('.notebooks #new-notebook').removeClass('hide')
    }

    public render(notebooks: string[]): void {
        $('.notebooks .list').html(
            notebooks.map(n => "<div id=\"notebook_" + Utils.sha1hex(n) + "\" class=\"notebook\"><div>" + n + "</div></div>")
                     .join("\n")
        );

        notebooks.forEach(n => $("#notebook_" + Utils.sha1hex(n)).click(() => this.showOpenNotebookDialog(n)));
    }

    private showNewNotebookDialog() {
        $("#notebook-name").val("");
        $("#notebook-password").val("");
        $("#notebook-password-confirm").val("");
        this.resetNewNotebookValidation();
        (<any>$('#new-notebook-modal-dialog')).modal('open');
    }

    private resetNewNotebookValidation() {
        $("#notebook-name").removeClass("valid");
        $("#notebook-password").removeClass("valid");
        $("#notebook-password-confirm").removeClass("valid");
        $("#notebook-name").removeClass("invalid");
        $("#notebook-password").removeClass("invalid");
        $("#notebook-password-confirm").removeClass("invalid");
    }

    private async notebookCreate(): Promise<void> {
        var ret = await this.onNotebookCreate($("#notebook-name").val(),
                                              $("#notebook-password").val(),
                                              $("#notebook-password-confirm").val());

        if (ret.dialogAction == "CLOSE")
            (<any>$('#new-notebook-modal-dialog')).modal('close');

        else {
            this.resetNewNotebookValidation();
            $("#notebook-name").addClass(ret.nameValid ? "valid" : "invalid");
            $("#notebook-password").addClass(ret.passwordValid ? "valid" : "invalid");
            $("#notebook-password-confirm").addClass(ret.confirmValid ? "valid" : "invalid");
        }
    }

    private showOpenNotebookDialog(name: string): void {
        $("#open-notebook-password").val("");
        this.openingNotebookName = name;
        (<any>$('#open-notebook-modal-dialog')).modal('open');
        $('#open-notebook-password').focus();
    }

    private async notebookOpen() {
        await this.onNotebookSelected(this.openingNotebookName, $("#open-notebook-password").val());
        (<any>$('#open-notebook-modal-dialog')).modal('close');
    }
}