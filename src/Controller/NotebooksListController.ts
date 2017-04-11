///<reference path="Controller.ts"/>

class NotebooksListController extends Controller {

    public onLogout: () => void;
    public onNotebookSelected: () => void;

    constructor(domain: Domain, notebooksListView: NotebooksListView) {
        super(domain, notebooksListView);

        notebooksListView.onLogoutRequest = () => this.onLogoutRequest();
        notebooksListView.onNotebookCreate = async (n,p,c): Promise<NewNotebookValidationResult> => await this.onNotebookCreate(n, p, c);
        notebooksListView.onNotebookSelected = async (n,p) => await this.notebookSelected(n,p);
    }

    private async onLogoutRequest(): Promise<void> {
        this.view.showWaiting();
        try {
            await this.domain.doLogout();
        }
        finally {
            this.view.hideWaiting();
            this.onLogout();
        }
    }

    public showView(): void {
        this.view.render(this.domain.getNotebooks());
        super.showView();
    }

    private async onNotebookCreate(name: string, password: string, confirm: string): Promise<NewNotebookValidationResult> {

        var ret = this.validateNewNotebook(name, password, confirm);
        if (ret.dialogAction == "OPEN") return ret;

        this.view.showWaiting();
        await this.domain.createNewNotebook(name, password);
        this.view.render(this.domain.getNotebooks());
        this.view.hideWaiting();

        return ret;
    }

    private validateNewNotebook(name: string, password: string, confirm: string) {
        var ret: NewNotebookValidationResult = {
            nameValid: name.length > 0 && this.notAlreadyInUse(name),
            passwordValid: password.length > 3,
            confirmValid: password.length > 3 && password === confirm,
            dialogAction: "OPEN"
        }
        ret.dialogAction = ret.nameValid && ret.passwordValid && ret.confirmValid ? "CLOSE" : "OPEN";
        return ret;
    }

    private notAlreadyInUse(name: string): boolean {
        return this.domain.getNotebooks().filter(n => n === name).length == 0;
    }

    private async notebookSelected(name: string, password: string): Promise<void> {
        this.view.showWaiting();
        try {
            await this.domain.loadNotebook(name, password);
            this.onNotebookSelected();
        }
        catch(e) {
            console.log(e);
            if (typeof e === "string")
                this.view.showMessage(Txt.s("ERROR"), Txt.s(e));
            else
                this.view.showMessage(Txt.s("ERROR"), Txt.s("LOADING_GENERIC_ERROR"));
        }
        finally {
            this.view.hideWaiting();
        }
    }
}