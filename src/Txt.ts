class Txt {

    private static dict: any = {
        "INVALID_PASSWORD": "An error has occurred while deciphering your data (wrong password?).",
        "ERROR": "Error",
        "VIEW_PASSWORD_TITLE": "View password",
        "VIEW_PASSWORD_TEXT": "Here is your password:",
        "CANT_DELETE_LAST_ENTRY": "You can't delete this note. At least one note must be present inside a notebook.",
        "NO_LINK": "no link",
        "VALIDATION_TITLE_NOT_UNIQUE": "Another note inside this notebook has this title. Please try changing it.",
        "VALIDATION_EMPTY_TITLE": "Title can't be empty.",
        "NEW_NOTE_TITLE": "New note",
        "NEW_NOTE_CONTENT": "Insert text here...",
        "LOADING_GENERIC_ERROR": "An error has occurred while loading and deciphering your data (wrong password?)...",
        "COPY_PWD": "COPY"
    }

    public static s(key: string): string {
        if (this.dict[key] !== 'undefined')
            return this.dict[key];
        else
            return key;
    }
}