///<reference path="View.ts"/>

class LoginView extends View {

    public onLoginRequest: () => void;

    protected registerEventHandlers(): void {
        $('#login-button').click(() => this.onLoginRequest());
    }

    public show(): void {
        $('.login-to-header').removeClass('login-to-header-stage2')
        $('#login-button').addClass('visible')
        $('#logout-button').removeClass('visible')
        $('.login-to-header .spinner').removeClass('visible');
        $('.notebooks #new-notebook').addClass('hide')
    }

}