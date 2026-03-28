/**
 * Authentication response model
 * Contains authentication state and token information
 */
export class Auth {
    token?: string;
    isAuthenticated: boolean;
    partialToken: string;

    constructor(isAuthenticated: boolean, partialToken: string) {
        this.isAuthenticated = isAuthenticated;
        this.partialToken = partialToken;
    }

    /**
     * Factory method for successful authentication
     */
    static success(partialToken: string): Auth {
        return new Auth(true, partialToken);
    }

    /**
     * Factory method for failed authentication
     */
    static failure(): Auth {
        return new Auth(false, '');
    }
}