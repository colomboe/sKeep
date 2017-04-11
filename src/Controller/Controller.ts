class Controller {

    view: View;
    domain: Domain;

    constructor(domain: Domain, view: View) {
        this.domain = domain;
        this.view = view;
    }

    showView(): void {
        this.view.show();
    }

}