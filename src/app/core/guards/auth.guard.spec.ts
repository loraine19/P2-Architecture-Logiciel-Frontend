import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';

import { authGuard, guestGuard, redirectGuard } from './auth.guard';
import { UserService } from '../service/user.service';

describe('Auth Guards', () => {
    let userService: jest.Mocked<UserService>;
    let router: Router;

    beforeEach(() => {
        const userSpy = { isLoggedIn: jest.fn() };

        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                { provide: UserService, useValue: userSpy }
            ]
        });

        userService = TestBed.inject(UserService) as jest.Mocked<UserService>;
        router = TestBed.inject(Router);
    });

    describe('authGuard', () => {
        it('should return true when user is logged in', () => {
            userService.isLoggedIn.mockReturnValue(true);
            const result = TestBed.runInInjectionContext(() => authGuard());
            expect(result).toBe(true);
        });

        it('should return a UrlTree to /home when not logged in', () => {
            userService.isLoggedIn.mockReturnValue(false);
            const result = TestBed.runInInjectionContext(() => authGuard());
            expect(result).toBeInstanceOf(UrlTree);
            expect((result as UrlTree).toString()).toBe('/home');
        });
    });

    describe('guestGuard', () => {
        it('should return true when user is not logged in', () => {
            userService.isLoggedIn.mockReturnValue(false);
            const result = TestBed.runInInjectionContext(() => guestGuard());
            expect(result).toBe(true);
        });

        it('should return a UrlTree to /studentList when already logged in', () => {
            userService.isLoggedIn.mockReturnValue(true);
            const result = TestBed.runInInjectionContext(() => guestGuard());
            expect(result).toBeInstanceOf(UrlTree);
            expect((result as UrlTree).toString()).toBe('/studentList');
        });
    });

    describe('redirectGuard', () => {
        it('should return a UrlTree to /home when not logged in', () => {
            userService.isLoggedIn.mockReturnValue(false);
            const result = TestBed.runInInjectionContext(() => redirectGuard());
            expect(result).toBeInstanceOf(UrlTree);
            expect((result as UrlTree).toString()).toBe('/home');
        });

        it('should return a UrlTree to /studentList when logged in', () => {
            userService.isLoggedIn.mockReturnValue(true);
            const result = TestBed.runInInjectionContext(() => redirectGuard());
            expect(result).toBeInstanceOf(UrlTree);
            expect((result as UrlTree).toString()).toBe('/studentList');
        });
    });
});
