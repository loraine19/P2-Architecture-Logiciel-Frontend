import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';

import { authGuard, guestGuard, redirectGuard } from './auth.guard';
import { UserService } from '../service/user.service';

/**
 * Unit tests for 3 route guards: authGuard, guestGuard, redirectGuard
 * Each guard function is wrapped in TestBed.runInInjectionContext()
 * to give them a valid Angular dependency injection context during tests
 */

describe('Auth Guards', () => {
    let userService: jest.Mocked<UserService>;
    let router: Router;

    /** TEST SETUP */
    /* beforeEach */
    // runs before every test — creates a TestBed module with a mocked UserService and provideRouter([]) 
    beforeEach(() => {
        // replace the real UserService with a jest spy 
        const userSpy = { isLoggedIn: jest.fn() };

        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                { provide: UserService, useValue: userSpy }
            ]
        });

        // inject the mocked UserService and Router for use in tests
        userService = TestBed.inject(UserService) as jest.Mocked<UserService>;
        router = TestBed.inject(Router);
    });

    /** GUARD TESTS */
    /* AUTH GUARD */
    describe('authGuard', () => {
        it('should return true when user is logged in', () => {
            // mock isLoggedIn() to return true
            userService.isLoggedIn.mockReturnValue(true);
            // run the guard function in an injection context and check it returns true
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

    /** GUARD TESTS */
    /* GUEST GUARD */
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

    /** GUARD TESTS */
    /* REDIRECT GUARD */
    // always redirects — never returns true — used on the root path
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
