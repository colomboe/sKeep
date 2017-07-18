class Application {

    private ui: UI;
    private domain: Domain;

    public async start(): Promise<void> {
        var config = new Configuration();
        this.domain = config.domain(config.storage(), config.fileFormat(), config.userStatsService());
        this.ui = config.ui(this.domain);

        let loginData = await this.domain.isLogged();
        if (loginData.logged) {
            this.domain.updateLoginStats(loginData);
            await this.ui.setState(UIState.LOADING_NOTEBOOKS);
        }
        else
            await this.ui.setState(UIState.LOGIN);
    }
}