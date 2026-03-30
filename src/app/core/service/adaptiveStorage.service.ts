import { Injectable } from '@angular/core';
import { PlatformDetectionService } from './platformDetection.service';
import { UserDTO } from '../models/User';
import { StorageServiceInterface } from './servicesInterfaces/storageServiceInterface';
import { LoginResponse } from '../DTO/LoginResponse';

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

    // Storage keys
    private readonly JWT_KEY_NAME = 'auth_jwt_token';
    private readonly JWT_REFRESH_KEY_NAME = 'auth_refresh_token';
    private readonly AUTH_STATE_KEY_NAME = 'authState';
    private readonly DEV_MODE = true;

    constructor(private platformDetection: PlatformDetectionService) { }

    /** PUBLIC METHODS */

    /* GET AUTH TOKEN */
    async getAuthToken(): Promise<string | null> {
        return await this.getMobileToken();
    }

    /* SET AUTH TOKEN */
    async setAuthToken(token: string): Promise<void> {
        return await this.storeMobileToken(token);
    }

    /* GET AUTH REFRESH TOKEN */
    async getAuthRefreshToken(): Promise<string | null> {
        return await this.getMobileRefreshToken();
    }

    /* SET AUTH REFRESH TOKEN */
    async setAuthRefreshToken(token: string): Promise<void> {
        return await this.storeMobileRefreshToken(token);
    }

    /* SET AUTH STATE */
    setAuthState(loginResponse: LoginResponse): void {
        // Store auth state in localStorage for both platforms 
        localStorage.setItem(this.AUTH_STATE_KEY_NAME, JSON.stringify({
            isLoggedIn: loginResponse.success,
            authType: loginResponse.authType,
            user: loginResponse.user
        }));
    }

    /* GET AUTH STATE */
    getAuthState(): boolean {
        const authStateString = localStorage.getItem(this.AUTH_STATE_KEY_NAME);
        if (!authStateString) return false;
        try {
            const authState = JSON.parse(authStateString);
            return authState.isLoggedIn;
        } catch (error) {
            return false;
        }
    }

    /* GET AUTH STATE USER */
    getAuthStateUser(): UserDTO | null {
        const authStateString = localStorage.getItem(this.AUTH_STATE_KEY_NAME);
        if (!authStateString) return null;
        try {
            const authState = JSON.parse(authStateString);
            return authState.user || null;
        } catch (error) {
            return null;
        }
    }

    /* CLEAR AUTH DATA */
    async clearAuthData(): Promise<void> {
        localStorage.removeItem(this.AUTH_STATE_KEY_NAME);
        if (this.platformDetection.isMobile()) {
            await this.clearMobileStorage();
        }
    }

    /** PRIVATE METHODS */

    /* STORE MOBILE TOKEN */
    private async storeMobileToken(token: string): Promise<void> {
        if ((window as any).SecureStorage) {
            try {
                await (window as any).SecureStorage.set(this.JWT_KEY_NAME, token);
            } catch (error) {
                throw new Error('Secure storage failed', { cause: error });
            }
        } else if (this.DEV_MODE) {
            // Mode fallback pour le développement
            localStorage.setItem(this.JWT_KEY_NAME, token);
        }
    }

    /* GET MOBILE TOKEN */
    private async getMobileToken(): Promise<string | null> {
        if ((window as any).SecureStorage) {
            try {
                return await (window as any).SecureStorage.get(this.JWT_KEY_NAME);
            } catch (error) {
                console.error('Secure storage failed', error);
                return null;
            }
        } else if (this.DEV_MODE) {
            return localStorage.getItem(this.JWT_KEY_NAME);
        }
        return null;
    }

    /* STORE MOBILE REFRESH TOKEN */
    private async storeMobileRefreshToken(token: string): Promise<void> {
        if ((window as any).SecureStorage) {
            try {
                await (window as any).SecureStorage.set(this.JWT_REFRESH_KEY_NAME, token);
            } catch (error) {
                throw new Error('Secure storage failed', { cause: error });
            }
        } else if (this.DEV_MODE) {
            localStorage.setItem(this.JWT_REFRESH_KEY_NAME, token);
        }
    }

    /* GET MOBILE REFRESH TOKEN */
    private async getMobileRefreshToken(): Promise<string | null> {
        if ((window as any).SecureStorage) {
            try {
                return await (window as any).SecureStorage.get(this.JWT_REFRESH_KEY_NAME);
            } catch (error) {
                console.error('Secure storage failed', error);
                return null;
            }
        } else if (this.DEV_MODE) {
            return localStorage.getItem(this.JWT_REFRESH_KEY_NAME);
        }
        return null;
    }

    /* CLEAR MOBILE STORAGE */
    private async clearMobileStorage(): Promise<void> {
        if ((window as any).SecureStorage) {
            await (window as any).SecureStorage.remove(this.JWT_KEY_NAME);
            await (window as any).SecureStorage.remove(this.JWT_REFRESH_KEY_NAME);
        } else if (this.DEV_MODE) {
            localStorage.removeItem(this.JWT_KEY_NAME);
            localStorage.removeItem(this.JWT_REFRESH_KEY_NAME);
        }
    }
}