import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';

import { authGuard, guestGuard, redirectGuard } from './auth.guard';
import { UserService } from '../service/user.service';

describe('Auth Guards', () => {
    let userService: jest.Mocked<UserService>;
    let router: jest.Mocked<Router>;

    beforeEach(() => {
        const userSpy = { isLoggedIn: jest.fn() };
        const routerSpy = { navigate: jest.fn() };

        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                { provide: UserService, useValue: userSpy },
                { provide: Router, useValue: routerSpy }
            ]
        });

        userService = TestBed.inject(UserService) as jest.Mocked<UserService>;
        router = TestBed.inject(Router) as jest.Mocked<Router>;
    });

    describe('authGuard', () => {
        it('should return true when user is logged in', () => {
            userService.isLoggedIn.mockReturnValue(true);
            const result = TestBed.runInInjectionContext(() => authGuard());
            expect(result).toBe(true);
        });

        it('should return false and navigate to /home when not logged in', () => {
            userService.isLoggedIn.mockReturnValue(false);
            const result = TestBed.runInInjectionContext(() => authGuard());
            expect(result).toBe(false);
            expect(router.navigate).toHaveBeenCalledWith(['/home']);
        });
    });

    describe('guestGuard', () => {
        it('should return true when user is not logged in', () => {
            userService.isLoggedIn.mockReturnValue(false);
            const result = TestBed.runInInjectionContext(() => guestGuard());
            expect(result).toBe(true);
        });

        it('should return false and navigate to /studentList when already logged in', () => {
            userService.isLoggedIn.mockReturnValue(true);
            const result = TestBed.runInInjectionContext(() => guestGuard());
            expect(result).toBe(false);
            expect(router.navigate).toHaveBeenCalledWith(['/studentList']);
        });
    });

    describe('redirectGuard', () => {
        it('should always return false', () => {
            userService.isLoggedIn.mockReturnValue(false);
            const result = TestBed.runInInjectionContext(() => redirectGuard());
            expect(result).toBe(false);
        });

        it('should redirect to /home when not logged in', () => {
            userService.isLoggedIn.mockReturnValue(false);
            TestBed.runInInjectionContext(() => redirectGuard());
            expect(router.navigate).toHaveBeenCalledWith(['/home']);
        });

        it('should redirect to /studentList when logged in', () => {
            userService.isLoggedIn.mockReturnValue(true);
            TestBed.runInInjectionContext(() => redirectGuard());
            expect(router.navigate).toHaveBeenCalledWith(['/studentList']);
        });
    });
});
