import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { PlatformDetectionService } from './platformDetection.service';
import { AdaptiveStorageService } from './adaptiveStorage.service';
import { UserDTO } from '../models/User';
import { LoginResponse } from '../DTO/LoginResponse';

const mockUser: UserDTO = { firstName: 'John', lastName: 'Doe', login: 'john@test.com', password: '' };

/**
 * Integration tests — isLoggedIn() / getCurrentUser() with the real AdaptiveStorageService
 * isLoggedIn() and getCurrentUser() are simple delegations to AdaptiveStorageService.
 * Testing these with mocks would only test that Jest returns what we told it to.
 * Here we validate the real integration: UserService → AdaptiveStorageService → localStorage.
 */
describe('UserService — integration isLoggedIn() / getCurrentUser()', () => {
    let realService: UserService;
    let realStorage: AdaptiveStorageService;
    let intHttpMock: HttpTestingController;

    /** TEST SETUP */
    /* beforeEach */
    // no mock for AdaptiveStorageService — we let the real service read/write localStorage
    beforeEach(() => {
        localStorage.clear();
        const platformSpy = { isMobile: jest.fn().mockReturnValue(false) };
        const routerSpy = { navigate: jest.fn() };

        TestBed.configureTestingModule({
            providers: [
                UserService,
                AdaptiveStorageService,
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: PlatformDetectionService, useValue: platformSpy },
                { provide: Router, useValue: routerSpy }
            ]
        });

        realService = TestBed.inject(UserService);
        realStorage = TestBed.inject(AdaptiveStorageService);
        intHttpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        intHttpMock.verify();
        localStorage.clear();
    });

    /** SERVICE TESTS */
    /* IS LOGGED IN */
    // checks real localStorage state, not a mock value
    describe('isLoggedIn()', () => {
        it('should return false when localStorage has no auth state', () => {
            expect(realService.isLoggedIn()).toBe(false);
        });

        it('should return true after a successful LoginResponse is stored', () => {
            // setAuthState is called natively — real write to localStorage
            realStorage.setAuthState(new LoginResponse(true, 'OK', mockUser));
            expect(realService.isLoggedIn()).toBe(true);
        });
    });

    /* GET CURRENT USER */
    // same — reads what was actually written to localStorage
    describe('getCurrentUser()', () => {
        it('should return null when localStorage has no auth state', () => {
            expect(realService.getCurrentUser()).toBeNull();
        });

        it('should return the stored user after LoginResponse is saved', () => {
            realStorage.setAuthState(new LoginResponse(true, 'OK', mockUser));
            expect(realService.getCurrentUser()).toEqual(mockUser);
        });
    });
});
