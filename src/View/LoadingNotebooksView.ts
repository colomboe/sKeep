///<reference path="View.ts"/>

class LoadingNotebooksView extends View {

    public show(): void {
        $('.login-to-header').removeClass('login-to-header-stage2')
        $('#login-button').removeClass('visible')
        $('#logout-button').removeClass('visible')
        $('.login-to-header .spinner').addClass('visible');
        $('.notebooks #new-notebook').addClass('hide')
    }

}