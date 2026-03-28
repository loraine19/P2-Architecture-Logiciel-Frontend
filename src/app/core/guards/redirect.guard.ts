import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../service/user.service';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

/**
 * Smart redirect guard for root route navigation
 * Redirects authenticated users to student list, unauthenticated users to home
 */
export const redirectGuard = (): Observable<boolean> => {
    const userService = inject(UserService);
    const router = inject(Router);

    return userService.isAuthenticated().pipe(
        take(1),
        map(isAuthenticated => {
            console.log('Redirect Guard - Authentication state:', isAuthenticated); // Debug log

            if (isAuthenticated) {
                console.log('Redirect Guard - Authenticated user, redirecting to student list');
                router.navigate(['/studentList']);
            } else {
                console.log('Redirect Guard - Unauthenticated user, redirecting to home');
                router.navigate(['/home']);
            }
            return false; // Always block navigation to empty route
        })
    );
};