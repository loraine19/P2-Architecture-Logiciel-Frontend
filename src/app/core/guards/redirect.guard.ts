import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../service/user.service';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

/**
 * Smart redirect guard - redirects based on authentication state
 */
export const redirectGuard = (): Observable<boolean> => {
    const userService = inject(UserService);
    const router = inject(Router);

    return userService.isAuthenticated().pipe(
        take(1),
        map(isAuthenticated => {
            if (isAuthenticated) {
                // User is authenticated, redirect to student list
                router.navigate(['/studentList']);
            } else {
                // User is not authenticated, redirect to home
                router.navigate(['/home']);
            }
            return false; // Always return false to prevent navigation to the empty route
        })
    );
};