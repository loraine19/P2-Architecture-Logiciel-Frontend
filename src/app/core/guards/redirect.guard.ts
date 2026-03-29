import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../service/user.service';

/**
 * Redirect guard - handles root route navigation based on auth state
 */
export const redirectGuard = (): boolean => {
    const userService = inject(UserService);
    const router = inject(Router);

    const route = userService.isLoggedIn() ? '/studentList' : '/home';
    router.navigate([route]);
    return false;
};