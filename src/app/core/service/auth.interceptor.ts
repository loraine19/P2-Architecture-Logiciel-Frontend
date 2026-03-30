import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { PlatformDetectionService } from './platformDetection.service';
import { AdaptiveStorageService } from './adaptiveStorage.service';
import { UserService } from './user.service';
import { Router } from '@angular/router';

/**
 * HTTP Interceptor for hybrid authentication and automatic token refresh
 * Mobile: JWT in Bearer header, Web: HTTP-only cookies
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(
        private platformDetection: PlatformDetectionService,
        private adaptiveStorage: AdaptiveStorageService,
        private userService: UserService,
        private router: Router
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        // Skip authentication for public endpoints
        if (this.isPublicEndpoint(request.url)) {
            return next.handle(request);
        }

        //  Clone the request to modify it & attach credentials if needed
        let authRequest = request;
        if (!this.platformDetection.isMobile()) {
            authRequest = request.clone({ withCredentials: true });
        }

        // For mobile, we need to fetch the token and attach it manually
        const requestObservable = this.platformDetection.isMobile()
            ? from(this.adaptiveStorage.getAuthToken()).pipe(
                switchMap((token: string | null) => {
                    if (token) {
                        authRequest = request.clone({ setHeaders: { 'Authorization': `Bearer ${token}` } });
                    }
                    return next.handle(authRequest);
                })
            )
            : next.handle(authRequest);

        // Handle 401 errors globally
        return requestObservable.pipe(
            catchError((error: HttpErrorResponse) => {
                // If 401 and it's NOT the refresh route itself failing
                if (error.status === 401 && !request.url.includes('/api/refresh')) {
                    return this.handle401Error(authRequest, next);
                }
                return throwError(() => error);
            })
        );
    }

    /** PRIVATE METHODS */

    /* HANDLE 401 ERROR */
    private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return this.userService.refreshAccessToken().pipe(
            switchMap(() => {
                // Token successfully refreshed.
                // For Web, simply retry the request (cookies are automatically attached)
                if (!this.platformDetection.isMobile()) {
                    return next.handle(request.clone({ withCredentials: true }));
                }

                // For Mobile, fetch the newly stored token and attach it
                return from(this.adaptiveStorage.getAuthToken()).pipe(
                    switchMap((newToken: string | null) => {
                        return next.handle(request.clone({
                            setHeaders: { 'Authorization': `Bearer ${newToken}` }
                        }));
                    })
                );
            }),
            catchError((refreshError) => {
                // Refresh failed (e.g., refresh token also expired)
                this.userService.logout();
                this.router.navigate(['/login'], { queryParams: { msg: 'Session expired. Please log in again.', error: true } });
                return throwError(() => refreshError);
            })
        );
    }

    /* IS PUBLIC ENDPOINT */
    private isPublicEndpoint(url: string): boolean {
        const publicEndpoints = ['/api/register', '/api/login', '/api/public', '/assets/'];
        return publicEndpoints.some(endpoint => url.includes(endpoint));
    }
}