class HttpUserStatsService implements UserStatsService {

    private readonly endpoint: string;

    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    public addAccountIfMissing(loginData: LoginData): void {
        $.post(this.endpoint, { email: loginData.email, name: loginData.name } );
    }

}