import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { PlatformDetectionService } from './platform-detection.service';
import { AdaptiveStorageService } from './adaptiveStorage.service';
import { UserService } from './user.service';
import { Router } from '@angular/router';

/**
 * HTTP Interceptor for hybrid authentication
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

        // Exclude public endpoints from interception
        if (this.isPublicEndpoint(request.url)) return next.handle(request);

        // 1. Mobile platform - retrieve token from adaptive storage and add Authorization header
        if (this.platformDetection.isMobile()) {
            return from(this.adaptiveStorage.getAuthToken()).pipe(
                // If no token, proceed without modifying the request
                switchMap((token: string | null) => {
                    if (!token) return next.handle(request);
                    // Cloned request with Authorization header
                    const authRequest = request.clone({
                        setHeaders: { 'Authorization': `Bearer ${token}` }
                    });
                    return next.handle(authRequest);
                })
            );
        }

        // Web platform - rely on browser's cookie handling (withCredentials)
        return next.handle(request.clone({ withCredentials: true })).pipe(
            // Optionally, handle 401 responses to trigger logout or token refresh
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    this.userService.refreshAccessToken(this.platformDetection.isMobile()).subscribe(
                        (response) => {
                            if (!response) {
                                this.userService.logout();
                                this.router.navigate(['/login'], { queryParams: { msg: 'Your session has expired. Please log in again.', error: true } });
                            }
                            else {
                                location.reload();
                            }
                        }
                    );
                }
                return throwError(() => error);
            })
        );
    }

    private isPublicEndpoint(url: string): boolean {
        const publicEndpoints = ['/api/register', '/api/login', '/api/public', '/assets/'];
        return publicEndpoints.some(endpoint => url.includes(endpoint));
    }
}