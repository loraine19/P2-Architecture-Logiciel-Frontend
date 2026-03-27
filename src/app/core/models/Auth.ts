export class Auth {
    token?: string;
    isAuthenticated: boolean;
    partialToken: string;


    constructor(isAuthenticated: boolean, partialToken: string) {
        this.isAuthenticated = isAuthenticated;
        this.partialToken = partialToken;
    }
}