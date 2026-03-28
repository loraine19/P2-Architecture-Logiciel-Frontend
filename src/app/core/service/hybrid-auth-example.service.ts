import { Injectable } from '@angular/core';
import { UserService } from '../service/user.service';
import { PlatformDetectionService } from '../service/platform-detection.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Example service demonstrating hybrid authentication usage
 * Shows how components should interact with the new hybrid auth system
 */
@Injectable({
    providedIn: 'root'
})
export class HybridAuthExampleService {

    constructor(
        private userService: UserService,
        private platformDetection: PlatformDetectionService
    ) { }

    /**
     * Example: Login with platform detection
     * @param {any} credentials - Login credentials object
     * @returns {Observable<any>} Login result observable
     */
    exampleLogin(credentials: any): Observable<any> {
        console.log('Example Login - Platform:', this.platformDetection.getPlatform());

        return this.userService.login(credentials).pipe(
            tap(result => {
                if (this.platformDetection.isMobile()) {
                    console.log('Mobile login successful - JWT stored in secure storage');
                } else {
                    console.log('Web login successful - HTTP-only cookie set by backend');
                }
            })
        );
    }

    /**
     * Example: Check authentication state
     * @returns {Observable<boolean>} Authentication state observable
     */
    exampleCheckAuth(): Observable<boolean> {
        console.log('Example Auth Check - Platform:', this.platformDetection.getPlatform());

        return this.userService.checkAuthState().pipe(
            tap(isAuth => {
                console.log(`Authentication state: ${isAuth}`);
                if (this.platformDetection.isMobile()) {
                    console.log('Mobile: Auth state from secure storage');
                } else {
                    console.log('Web: Auth state with cookie validation');
                }
            })
        );
    }

    /**
     * Example: Logout with platform handling
     */
    exampleLogout(): void {
        console.log('Example Logout - Platform:', this.platformDetection.getPlatform());

        this.userService.logout();

        if (this.platformDetection.isMobile()) {
            console.log('Mobile: JWT cleared from secure storage');
        } else {
            console.log('Web: HTTP-only cookie cleared by backend');
        }
    }

    /**
     * Example: Get current authentication state (for components)
     * @returns {boolean} Synchronous auth state
     */
    isCurrentlyAuthenticated(): boolean {
        return this.userService.isLoggedIn();
    }

    /**
     * Example: Subscribe to auth state changes (for reactive components)
     * @returns {Observable<boolean>} Auth state stream
     */
    getAuthStateStream(): Observable<boolean> {
        return this.userService.isLoggedIn$;
    }
}