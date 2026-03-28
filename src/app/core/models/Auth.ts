/**
 * Authentication response model for hybrid authentication
 * Supports both JWT (mobile) and HTTP-only cookie (web) responses
 * Modern interface approach for better type safety
 */
export interface Auth {
    /** Authentication success status */
    success?: boolean;

    /** Authentication state flag */
    isAuthenticated?: boolean;

    /** Success/error message from backend */
    message?: string;

    /** JWT token for mobile authentication */
    token?: string;

    /** Alternative JWT field name */
    jwt?: string;

    /** Legacy partial token field (backward compatibility) */
    partialToken?: string;

    /** User information (optional) */
    user?: {
        id?: string;
        login?: string;
        roles?: string[];
    };

    /** Platform-specific data */
    platform?: 'web' | 'mobile';

    /** Authentication type used */
    authType?: 'cookie' | 'jwt';

    /** Token expiration time (for JWT) */
    expiresIn?: number;

    /** Refresh token (for JWT, optional) */
    refreshToken?: string;
}

/**
 * Legacy Auth class for backward compatibility
 * @deprecated Use Auth interface instead for new code
 */
export class AuthClass {
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
    static success(partialToken: string): AuthClass {
        return new AuthClass(true, partialToken);
    }

    /**
     * Factory method for failed authentication
     */
    static failure(): AuthClass {
        return new AuthClass(false, '');
    }
}