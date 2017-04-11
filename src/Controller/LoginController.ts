///<reference path="Controller.ts"/>

class LoginController extends Controller {

    constructor(domain: Domain, loginView: LoginView) {
        super(domain, loginView);

        loginView.onLoginRequest = () => this.onLoginRequest();
    }

    public onLoginRequest(): void {
        this.domain.doLogin();
    }
}