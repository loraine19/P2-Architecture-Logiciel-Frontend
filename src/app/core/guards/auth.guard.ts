import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../service/user.service';

/**
 * Auth guard - protects routes from unauthorized access
 */
export const authGuard = (): boolean => {
    const userService = inject(UserService);
    const router = inject(Router);

    if (!userService.isLoggedIn()) {
        router.navigate(['/home']);
        return false;
    }
    return true;
};

/**
 * Guest guard - prevents authenticated users from accessing public pages
 */
export const guestGuard = (): boolean => {
    const userService = inject(UserService);
    const router = inject(Router);

    if (userService.isLoggedIn()) {
        router.navigate(['/studentList']);
        return false;
    }
    return true;
};