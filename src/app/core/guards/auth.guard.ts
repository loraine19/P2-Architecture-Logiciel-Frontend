import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../service/user.service';

/* AUTH GUARD*/
// protects routes from unauthorized access/
export const authGuard = (): boolean => {
    const userService = inject(UserService);
    const router = inject(Router);
    if (!userService.isLoggedIn()) {
        router.navigate(['/home']);
        return false;
    }
    return true;
};


/* GUEST GUARD*/
//- prevents logged-in users from accessing certain routes (e.g., login, register)
export const guestGuard = (): boolean => {
    const userService = inject(UserService);
    const router = inject(Router);
    if (userService.isLoggedIn()) {
        router.navigate(['/studentList']);
        return false;
    }
    return true;
};

/* REDIRECT GUARD*/
// redirects logged-in users to the student list
export const redirectGuard = (): boolean => {
    const userService = inject(UserService);
    const router = inject(Router);
    const route = userService.isLoggedIn() ? '/studentList' : '/home';
    router.navigate([route]);
    return false;
};