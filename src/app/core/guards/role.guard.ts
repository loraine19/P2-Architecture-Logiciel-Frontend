import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../service/user.service';
import { map, take } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

/**
 * Role-based guard for admin-only routes (if needed in the future)
 * Example of composable guards in 2026 style
 */
export const adminGuard = (requiredRole: string = 'admin'): (() => Observable<boolean>) => {
    return (): Observable<boolean> => {
        const userService = inject(UserService);
        const router = inject(Router);

        return userService.isAuthenticated().pipe(
            take(1),
            map(isAuthenticated => {
                if (!isAuthenticated) {
                    router.navigate(['/login']);
                    return false;
                }


                // const userRole = userService.getCurrentUserRole();
                // if (userRole !== requiredRole) {
                //   router.navigate(['/unauthorized']);
                //   return false;
                // }

                return true;
            })
        );
    };
};

/**
 * Multiple guards can be composed for complex scenarios
 * Usage: canActivate: [authGuard, adminGuard('admin')]
 */