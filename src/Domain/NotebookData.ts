interface NotebookEntry {
    real: string;
    title: string;
    link: string;
}

interface Notebook {
    name: string;
    entries: NotebookEntry[];
}