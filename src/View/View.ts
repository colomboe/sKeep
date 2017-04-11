class View {

    protected readonly ESC_KEY_CODE = 27;
    protected readonly ENTER_KEY_CODE = 13;

    constructor() {
        this.registerEventHandlers();
    }

    protected registerEventHandlers(): void { };

    show(): void { };
    render(data: any): void { };

    showMessage(title: string, message: string): void {
        $('#message-box-title').text(title);
        $('#message-box-text').text(message);
        $('#message-box-textbox').css('display', 'none');
        this.showPopup();
    }

    showForCopy(title: string, message: string, copy: string) {
        $('#message-box-title').text(title);
        $('#message-box-text').text(message);
        $('#message-box-textbox').val(copy);
        $('#message-box-textbox').select()
        $('#message-box-textbox').css('display', 'block');
        this.showPopup();
        $('#message-box-textbox').focus();
    }

    showWaiting() {
        $('.wait').addClass('wait-visible');
    }

    hideWaiting() {
        $('.wait').removeClass('wait-visible');
    }

    private showPopup(): void {
        $('#message-box-close').click(() => this.closeMessage());
        $('#message-box').keydown((e) => {
            if (e.keyCode == this.ESC_KEY_CODE) this.closeMessage();
        });
        $('#message-box').addClass('message-box-visible');
        $('#message-box').focus();
    }

    private closeMessage()
    {
        $('#message-box-close').unbind('click');
        $('#message-box').unbind('keydown');
        $('#message-box').removeClass('message-box-visible');
    }
}