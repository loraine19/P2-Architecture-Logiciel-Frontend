import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PlatformDetectionService } from './platform-detection.service';

/**
 * Adaptive storage service for hybrid authentication
 * Uses HTTP-only cookies for web and secure storage for mobile
 * Abstracts platform-specific storage mechanisms
 */
@Injectable({
    providedIn: 'root'
})
export class AdaptiveStorageService {
    private readonly SECURE_STORAGE_KEY = 'auth_jwt_token';
    private readonly AUTH_STATE_KEY = 'auth_state';

    constructor(
        private platformDetection: PlatformDetectionService,
        private httpClient: HttpClient
    ) {
        console.log('AdaptiveStorageService initialized for platform:', this.platformDetection.getPlatform());
    }

    /**
     * Stores authentication token using platform-appropriate method
     * @param {string} token - JWT token to store
     * @param {boolean} isAuthenticated - Authentication state
     * @returns {Promise<void>} Storage operation promise
     */
    async storeAuthToken(token: string, isAuthenticated: boolean): Promise<void> {
        if (this.platformDetection.isMobile()) {
            await this.storeMobileToken(token);
            await this.storeMobileAuthState(isAuthenticated);
            console.log('Token stored in mobile secure storage');
        } else {
            // For web, token is stored as HTTP-only cookie by backend
            // We only store auth state locally for UI reactivity
            localStorage.setItem(this.AUTH_STATE_KEY, String(isAuthenticated));
            console.log('Auth state stored for web (cookie handled by backend)');
        }
    }

    /**
     * Retrieves authentication token using platform-appropriate method
     * @returns {Promise<string | null>} Token or null if not found
     */
    async getAuthToken(): Promise<string | null> {
        if (this.platformDetection.isMobile()) {
            const token = await this.getMobileToken();
            console.log('Retrieved token from mobile secure storage:', token ? '***' : null);
            return token;
        } else {
            // For web, token is in HTTP-only cookie (not accessible to JS)
            // Backend will handle token validation automatically
            console.log('Web platform: token managed by HTTP-only cookies');
            return null; // JS cannot access HTTP-only cookies
        }
    }

    /**
     * Retrieves authentication state
     * @returns {Promise<boolean>} Authentication state
     */
    async getAuthState(): Promise<boolean> {
        if (this.platformDetection.isMobile()) {
            const authState = await this.getMobileAuthState();
            console.log('Retrieved mobile auth state:', authState);
            return authState;
        } else {
            const authState = localStorage.getItem(this.AUTH_STATE_KEY) === 'true';
            console.log('Retrieved web auth state:', authState);
            return authState;
        }
    }

    /**
     * Clears authentication data using platform-appropriate method
     * @returns {Promise<void>} Clear operation promise
     */
    async clearAuthData(): Promise<void> {
        if (this.platformDetection.isMobile()) {
            await this.clearMobileStorage();
            console.log('Cleared mobile auth data');
        } else {
            localStorage.removeItem(this.AUTH_STATE_KEY);
            // HTTP-only cookie will be cleared by backend
            console.log('Cleared web auth state (cookie cleared by backend)');
        }
    }

    /**
     * Validates current session by checking with backend
     * @returns {Observable<boolean>} Session validity observable
     */
    validateSession(): Observable<boolean> {
        return this.httpClient.get<{ valid: boolean }>('/api/auth/validate').pipe(
            map(response => response.valid),
            catchError(() => of(false))
        );
    }

    /**
     * Stores JWT token in mobile secure storage
     * @private
     * @param {string} token - Token to store
     * @returns {Promise<void>} Storage operation promise
     */
    private async storeMobileToken(token: string): Promise<void> {
        if ((window as any).SecureStorage) {
            try {
                await (window as any).SecureStorage.set(this.SECURE_STORAGE_KEY, token);
            } catch (error) {
                console.warn('Secure storage failed, falling back to localStorage:', error);
                localStorage.setItem(this.SECURE_STORAGE_KEY, token);
            }
        } else {
            // Fallback for development/testing
            console.warn('Secure storage not available, using localStorage fallback');
            localStorage.setItem(this.SECURE_STORAGE_KEY, token);
        }
    }

    /**
     * Retrieves JWT token from mobile secure storage
     * @private
     * @returns {Promise<string | null>} Token or null
     */
    private async getMobileToken(): Promise<string | null> {
        if ((window as any).SecureStorage) {
            try {
                return await (window as any).SecureStorage.get(this.SECURE_STORAGE_KEY);
            } catch (error) {
                console.warn('Secure storage read failed, trying localStorage:', error);
                return localStorage.getItem(this.SECURE_STORAGE_KEY);
            }
        } else {
            // Fallback for development/testing
            return localStorage.getItem(this.SECURE_STORAGE_KEY);
        }
    }

    /**
     * Stores authentication state in mobile storage
     * @private
     * @param {boolean} isAuthenticated - Auth state
     * @returns {Promise<void>} Storage operation promise
     */
    private async storeMobileAuthState(isAuthenticated: boolean): Promise<void> {
        localStorage.setItem(this.AUTH_STATE_KEY, String(isAuthenticated));
    }

    /**
     * Retrieves authentication state from mobile storage
     * @private
     * @returns {Promise<boolean>} Auth state
     */
    private async getMobileAuthState(): Promise<boolean> {
        return localStorage.getItem(this.AUTH_STATE_KEY) === 'true';
    }

    /**
     * Clears mobile secure storage
     * @private
     * @returns {Promise<void>} Clear operation promise
     */
    private async clearMobileStorage(): Promise<void> {
        if ((window as any).SecureStorage) {
            try {
                await (window as any).SecureStorage.remove(this.SECURE_STORAGE_KEY);
            } catch (error) {
                console.warn('Secure storage clear failed:', error);
            }
        }
        localStorage.removeItem(this.SECURE_STORAGE_KEY);
        localStorage.removeItem(this.AUTH_STATE_KEY);
    }
}