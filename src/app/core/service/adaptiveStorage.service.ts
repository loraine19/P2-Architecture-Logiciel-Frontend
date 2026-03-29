import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PlatformDetectionService } from './platform-detection.service';
import { LoginResponse } from "../models/LoginResponse";
import { UserDTO } from "../models/User";
import { StorageServiceInterface } from './servicesInterfaces/storageServiceInterface';

/**
 * Simple adaptive storage service for JWT tokens
 * Mobile: Uses native secure storage ONLY (Keychain/Keystore)
 * Web: Not used (cookies handled by browser)
 * NO encryption fallback - secure storage or nothing
 */
@Injectable({
    providedIn: 'root'
})
export class AdaptiveStorageService implements StorageServiceInterface {
    // Storage key name
    private readonly JWT_KEY_NAME = 'auth_jwt_token';
    private readonly JWT_REFRESH_KEY_NAME = 'auth_refresh_token';
    private readonly AUTH_STATE_KEY_NAME = 'authState';
    private readonly DEV_MODE = true;

    constructor(
        private platformDetection: PlatformDetectionService,
        private httpClient: HttpClient
    ) { }



    /**
     * Retrieves authentication token (mobile only)
     */
    async getAuthToken(): Promise<string | null> {
        return await this.getMobileToken();
    }

    /**
     * Sets authentication token (mobile only)
     * NOTE: Requires Cordova/Capacitor secure storage plugin for production
     */
    async setAuthToken(token: string): Promise<void> {
        return await this.storeMobileToken(token);
    }

    /**
     * Retrieves authentication refresh token (mobile only)
     */
    async getAuthRefreshToken(): Promise<string | null> {
        return await this.getMobileRefreshToken();
    }

    /**
     * Sets authentication refresh token (mobile only)
     * NOTE: Requires Cordova/Capacitor secure storage plugin for production
     */
    async setAuthRefreshToken(token: string): Promise<void> {
        return await this.storeMobileRefreshToken(token);
    }

    setAuthState(loginResponse: LoginResponse): void {
        localStorage.setItem('authState', JSON.stringify({
            isLoggedIn: loginResponse.success,
            authType: loginResponse.authType,
            user: loginResponse.user
        }));
    }


    /**
     * Gets authentication state by checking if token exists
     */
    getAuthState(): boolean {
        const authStateString = localStorage.getItem('authState');
        if (!authStateString) return false;
        try {
            const authState = JSON.parse(authStateString);
            return authState.isLoggedIn;
        } catch (error) {
            return false;
        }
    }

    getAuthStateUser(): UserDTO | null {
        const authStateString = localStorage.getItem('authState');
        if (!authStateString) return null;
        try {
            const authState = JSON.parse(authStateString);
            return authState.user || null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Clears authentication data from storage
     */
    async clearAuthData(): Promise<void> {
        localStorage.removeItem('authState');
        if (this.platformDetection.isMobile()) {
            await this.clearMobileStorage();
        }
    }


    /** PRIVATE METHODS FOR MOBILE TOKEN MANAGEMENT */

    /**
     * Stores JWT token in mobile secure storage
     * Requires: cordova-plugin-secure-storage or @capacitor/preferences
     */
    private async storeMobileToken(token: string): Promise<void> {
        if ((window as any).SecureStorage) {
            try {
                await (window as any).SecureStorage.set(this.JWT_KEY_NAME, token);
                return;
            } catch (error) {
                throw new Error('Secure storage failed', { cause: error });
            }
        }
        // For development/testing only - do not use in production
        else if (this.DEV_MODE) localStorage.setItem(this.JWT_KEY_NAME, token);
    }

    /**
     * Retrieves JWT token from mobile secure storage
     */
    private async getMobileToken(): Promise<string | null> {
        if ((window as any).SecureStorage) {
            try {
                return await (window as any).SecureStorage.get(this.JWT_KEY_NAME);
            } catch (error) {
                console.error('Secure storage failed', error);
                return null;
            }
        }
        // For development/testing only - do not use in production
        else if (this.DEV_MODE) return localStorage.getItem(this.JWT_KEY_NAME);
        return null;
    }

    /**
     * Stores JWT refresh token in mobile secure storage
     * Requires: cordova-plugin-secure-storage or @capacitor/preferences
     */
    private async storeMobileRefreshToken(token: string): Promise<void> {
        if ((window as any).SecureStorage) {
            try {
                await (window as any).SecureStorage.set(this.JWT_REFRESH_KEY_NAME, token);
                return;
            } catch (error) {
                throw new Error('Secure storage failed', { cause: error });
            }
        }
        // For development/testing only - do not use in production
        else if (this.DEV_MODE) localStorage.setItem(this.JWT_REFRESH_KEY_NAME, token);
    }

    /**
     * Retrieves JWT refresh token from mobile secure storage
     */
    private async getMobileRefreshToken(): Promise<string | null> {
        if ((window as any).SecureStorage) {
            try {
                return await (window as any).SecureStorage.get(this.JWT_REFRESH_KEY_NAME);
            } catch (error) {
                console.error('Secure storage failed', error);
                return null;
            }
        }
        // For development/testing only - do not use in production
        else if (this.DEV_MODE) return localStorage.getItem(this.JWT_REFRESH_KEY_NAME);
        return null;
    }

    /**
     * Clears mobile secure storage
     */
    private async clearMobileStorage(): Promise<void> {
        if ((window as any).SecureStorage) {
            await (window as any).SecureStorage.remove(this.JWT_KEY_NAME);
        }
        // For development/testing only - do not use in production
        else if (this.DEV_MODE) {
            localStorage.removeItem(this.JWT_KEY_NAME);
        }
    }
}