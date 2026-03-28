import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../service/user.service';
import { map, take } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

/**
 * Role-based access guard for future admin functionality
 * Composable guard pattern for granular access control
 */
export const adminGuard = (requiredRole: string = 'admin'): (() => Observable<boolean>) => {
    return (): Observable<boolean> => {
        const userService = inject(UserService);
        const router = inject(Router);

        return userService.isAuthenticated().pipe(
            take(1),
            map(isAuthenticated => {
                console.log('Admin Guard - Authentication check:', isAuthenticated); // Debug log

                if (!isAuthenticated) {
                    console.log('Admin Guard - User not authenticated, redirecting to home');
                    router.navigate(['/home']);
                    return false;
                }

                // TODO: Implement role checking when user roles are added
                // const userRole = userService.getCurrentUserRole();
                // if (userRole !== requiredRole) {
                //     console.warn('Admin Guard - Insufficient permissions for user role:', userRole);
                //     router.navigate(['/home']);
                //     return false;
                // }

                console.log('Admin Guard - Access granted for required role:', requiredRole);
                return true;
            })
        );
    };
};

/**
 * Composable guard pattern for complex access control scenarios
 * Usage example: canActivate: [authGuard, adminGuard('admin')]
 */