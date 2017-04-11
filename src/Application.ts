class Application {

    private ui: UI;
    private domain: Domain;

    public async start(): Promise<void> {
        var config = new Configuration();
        this.domain = config.domain(config.storage(), config.fileFormat());
        this.ui = config.ui(this.domain);

        if (await this.domain.isLogged())
            await this.ui.setState(UIState.LOADING_NOTEBOOKS);
        else
            await this.ui.setState(UIState.LOGIN);
    }
}