import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PlatformDetectionService } from './platform-detection.service';
import { UserService } from './user.service';

/**
 * HTTP Interceptor for hybrid authentication
 * Automatically adds JWT Authorization header for mobile requests
 * Allows cookies to be sent automatically for web requests
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(
        private platformDetection: PlatformDetectionService,
        private userService: UserService
    ) { }

    /**
     * Intercepts HTTP requests to add authentication headers
     * @param {HttpRequest<any>} request - Original HTTP request
     * @param {HttpHandler} next - Next handler in the chain
     * @returns {Observable<HttpEvent<any>>} Modified request observable
     */
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        // Skip auth for public endpoints
        if (this.isPublicEndpoint(request.url)) {
            console.log('Skipping auth for public endpoint:', request.url);
            return next.handle(request);
        }

        if (this.platformDetection.isMobile()) {
            // Mobile: Add JWT token in Authorization header
            return from(this.userService.getAuthToken()).pipe(
                switchMap(token => {
                    if (token) {
                        const authRequest = request.clone({
                            setHeaders: {
                                'Authorization': `Bearer ${token}`,
                                'X-Platform': 'mobile'
                            }
                        });
                        console.log('Adding JWT Authorization header for mobile request');
                        return next.handle(authRequest);
                    } else {
                        console.log('No JWT token available for mobile request');
                        return next.handle(request);
                    }
                })
            );
        } else {
            // Web: Allow cookies to be sent automatically, add platform header
            const cookieRequest = request.clone({
                setHeaders: {
                    'X-Platform': 'web'
                },
                withCredentials: true // Ensure cookies are sent
            });
            console.log('Sending web request with credentials (cookies)');
            return next.handle(cookieRequest);
        }
    }

    /**
     * Checks if the endpoint is public (no auth required)
     * @private
     * @param {string} url - Request URL
     * @returns {boolean} True if public endpoint
     */
    private isPublicEndpoint(url: string): boolean {
        const publicEndpoints = [
            '/api/register',
            '/api/login',
            '/api/public',
            '/assets/'
        ];

        return publicEndpoints.some(endpoint => url.includes(endpoint));
    }
}