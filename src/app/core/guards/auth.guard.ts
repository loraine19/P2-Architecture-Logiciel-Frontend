import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../service/user.service';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

/**
 * Modern functional auth guard (2026 style)
 * Protects routes from unauthorized access
 */
export const authGuard = (): Observable<boolean> => {
    const userService = inject(UserService);
    const router = inject(Router);

    return userService.isAuthenticated().pipe(
        take(1),
        map(isAuthenticated => {
            console.log('Auth Guard - Is Authenticated:', isAuthenticated); // Debug log
            if (isAuthenticated) {
                return true;
            } else {
                // Redirect to login with return URL (prevent nested parameters)
                const currentUrl = router.url;
                console.log('Auth Guard - Redirecting to login, return URL:', currentUrl); // Debug log

                // Only add returnUrl if we're not already on login page
                if (!currentUrl.startsWith('/login')) {
                    router.navigate(['/login'], {
                        queryParams: { returnUrl: currentUrl }
                    });
                } else {
                    router.navigate(['/home']); // Clean redirect without params
                }
                return false;
            }
        })
    );
};

/**
 * Guest guard - prevents authenticated users from accessing login/register
 */
export const guestGuard = (): Observable<boolean> => {
    const userService = inject(UserService);
    const router = inject(Router);

    return userService.isAuthenticated().pipe(
        take(1),
        map(isAuthenticated => {
            console.log('Guest Guard - Is Authenticated:', isAuthenticated); // Debug log
            if (!isAuthenticated) {
                return true;
            } else {
                // Redirect authenticated users to dashboard/home
                console.log('Guest Guard - User already authenticated, redirecting to studentList');
                router.navigate(['/studentList']);
                return false;
            }
        })
    );
};