import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { PlatformDetectionService } from './platformDetection.service';
import { AdaptiveStorageService } from './adaptiveStorage.service';
import { UserService } from './user.service';
import { Router } from '@angular/router';
import { HttpErrorMessage } from '../constants/httpErrorMessage';

/**
 * Interceptor - Handles platform-aware authentication and automatic token refresh
 * Mobile: attaches JWT in Bearer header | Web: adds withCredentials for cookie forwarding
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(
        private platformDetection: PlatformDetectionService,
        private adaptiveStorage: AdaptiveStorageService,
        private userService: UserService,
        private router: Router
    ) { }

    /** PUBLIC */
    /* INTERCEPT */
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        if (this.isPublicEndpoint(request.url)) {
            return next.handle(request);
        }

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

        return requestObservable.pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401 && !request.url.includes('/api/refresh')) {
                    return this.handle401Error(authRequest, next);
                }
                return throwError(() => error);
            })
        );
    }

    /** PRIVATE */
    /* HANDLE 401 ERROR */
    // token expired: try to refresh, then retry the original request
    private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return this.userService.refreshAccessToken().pipe(
            switchMap(() => {
                if (!this.platformDetection.isMobile()) {
                    return next.handle(request.clone({ withCredentials: true }));
                }

                // fetch the newly stored token and attach it for mobile
                return from(this.adaptiveStorage.getAuthToken()).pipe(
                    switchMap((newToken: string | null) => {
                        return next.handle(request.clone({
                            setHeaders: { 'Authorization': `Bearer ${newToken}` }
                        }));
                    })
                );
            }),
            catchError((refreshError) => {
                // refresh token expired or invalid
                this.userService.logout();
                this.router.navigate(['/login'], { queryParams: { msg: HttpErrorMessage.SESSION_EXPIRED, error: true } });
                return throwError(() => refreshError);
            })
        );
    }

    /* IS PUBLIC ENDPOINT */
    // skip auth for open endpoints to avoid unnecessary token lookups
    private isPublicEndpoint(url: string): boolean {
        const publicEndpoints = ['/api/register', '/api/login', '/api/public', '/assets/'];
        return publicEndpoints.some(endpoint => url.includes(endpoint));
    }
}