import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../service/user.service';
import { map, take, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

/**
 * Modern functional auth guard with hybrid authentication support
 * Protects routes from unauthorized access using platform-appropriate storage
 * Compatible with both HTTP-only cookies (web) and JWT secure storage (mobile)
 */
export const authGuard = (): Observable<boolean> => {
    const userService = inject(UserService);
    const router = inject(Router);

    // Use the hybrid auth checking method for more reliable verification
    return userService.checkAuthState().pipe(
        take(1),
        map(isAuthenticated => {
            console.log('Hybrid Auth Guard - Is Authenticated:', isAuthenticated);
            if (isAuthenticated) {
                return true;
            } else {
                console.log('Hybrid Auth Guard - User not authenticated, redirecting to home');
                router.navigate(['/home']);
                return false;
            }
        })
    );
};

/**
 * Guest guard with hybrid authentication support
 * Prevents authenticated users from accessing login/register pages
 */
export const guestGuard = (): Observable<boolean> => {
    const userService = inject(UserService);
    const router = inject(Router);

    return userService.checkAuthState().pipe(
        take(1),
        map(isAuthenticated => {
            console.log('Hybrid Guest Guard - Is Authenticated:', isAuthenticated);
            if (!isAuthenticated) {
                return true;
            } else {
                console.log('Hybrid Guest Guard - User already authenticated, redirecting to studentList');
                router.navigate(['/studentList']);
                return false;
            }
        })
    );
};