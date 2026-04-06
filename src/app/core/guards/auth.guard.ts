import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { UserService } from '../service/user.service';

/**
 * Route guards for authentication-based access control
 * Returns UrlTree instead of calling navigate() so the router handles the redirect cleanly
 */

/** GUARD FUNCTION */
/* AUTH GUARD */
// blocks unauthenticated users from reaching protected routes
export const authGuard = (): boolean | UrlTree => {
    const userService = inject(UserService);
    if (!userService.isLoggedIn()) {
        return inject(Router).createUrlTree(['/home']);
    }
    return true;
};


/** GUARD FUNCTION */
/* GUEST GUARD */
// prevents already logged-in users from seeing the login or register pages
export const guestGuard = (): boolean | UrlTree => {
    const userService = inject(UserService);
    if (userService.isLoggedIn()) {
        return inject(Router).createUrlTree(['/studentList']);
    }
    return true;
};

/** GUARD FUNCTION */
/* REDIRECT GUARD */
// root path always redirects to the right page based on login state
export const redirectGuard = (): UrlTree => {
    const userService = inject(UserService);
    const route = userService.isLoggedIn() ? '/studentList' : '/home';
    return inject(Router).createUrlTree([route]);
};