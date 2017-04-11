class Utils {

    public static sha1hex(s: string): string {
        return (<any>asmCrypto).SHA1.hex(s);
    }

    public static toClipboard(s: string): void {
        var textArea = document.createElement("textarea");
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.width = '2em';
        textArea.style.height = '2em';
        textArea.style.padding = '0';
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
        textArea.style.background = 'transparent';
        textArea.value = s;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Copying text command was ' + msg);
        } catch (err) {
            console.log('Oops, unable to copy');
        }
        document.body.removeChild(textArea);
    }

    static extractLink(real: string): string {
        var m = real.match(/(https:\/\/\S+)/g);
        if (m != null) return m[0];
        m = real.match(/(http:\/\/\S+)/g);
        if (m != null) return m[0];
        m = /[^\/\n]?(www\S+)/g.exec(real);
        if (m != null) return m[1];
        return Txt.s("NO_LINK");
    }

    public static randomPassword(length: number): string {
        var newPassword = "";
        var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@#!";
        for (var i = length; i > 0; --i) newPassword += chars[Math.round(Math.random() * (chars.length - 1))];
        return newPassword;
    }
}