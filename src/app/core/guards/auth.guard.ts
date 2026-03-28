import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../service/user.service';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

/**
 * Modern functional auth guard 
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
                // Redirect to home if not authenticated
                console.log('Auth Guard - User not authenticated, redirecting to home');
                router.navigate(['/home']);
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