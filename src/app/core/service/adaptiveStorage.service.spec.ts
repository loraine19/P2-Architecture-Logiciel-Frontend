import { TestBed } from '@angular/core/testing';

import { AdaptiveStorageService } from './adaptiveStorage.service';
import { PlatformDetectionService } from './platformDetection.service';
import { LoginResponse } from '../DTO/LoginResponse';
import { UserDTO } from '../models/User';

/**
 * Unit tests for AdaptiveStorageService — platform-aware token and session storage
 * DEV_MODE is true so localStorage is used as a fallback instead of native SecureStorage
 * Platform is controlled by toggling isMobile() on the PlatformDetectionService spy
 */

// shared mock user reused across auth state tests
const mockUser: UserDTO = { firstName: 'John', lastName: 'Doe', login: 'john@test.com', password: '' };

describe('AdaptiveStorageService', () => {
    let service: AdaptiveStorageService;
    let platformSpy: jest.Mocked<PlatformDetectionService>;

    /** TEST SETUP */
    /* beforeEach */
    // builds a fresh TestBed module and resets localStorage before each test
    beforeEach(() => {
        const platform = { isMobile: jest.fn().mockReturnValue(false) };

        TestBed.configureTestingModule({
            providers: [
                AdaptiveStorageService,
                { provide: PlatformDetectionService, useValue: platform }
            ]
        });

        service = TestBed.inject(AdaptiveStorageService);
        platformSpy = TestBed.inject(PlatformDetectionService) as jest.Mocked<PlatformDetectionService>;
        // reset browser storage so each test starts with a clean slate
        localStorage.clear();
    });

    // clear storage after each test to prevent state from leaking into the next test
    afterEach(() => localStorage.clear());

    /** SERVICE TESTS */
    /* SERVICE INITIALIZATION */
    describe('Service Initialization', () => {
        it('should be created', () => {
            expect(service).toBeTruthy();
        });
    });

    /* GET AUTH TOKEN / SET AUTH TOKEN */
    // DEV_MODE uses localStorage as a fallback when native SecureStorage is not available
    describe('getAuthToken() / setAuthToken()', () => {
        it('should return null when no token stored', async () => {
            expect(await service.getAuthToken()).toBeNull();
        });

        it('should store and retrieve auth token via localStorage in dev mode', async () => {
            await service.setAuthToken('my-jwt-token');
            expect(await service.getAuthToken()).toBe('my-jwt-token');
        });
    });

    /* GET AUTH REFRESH TOKEN / SET AUTH REFRESH TOKEN */
    describe('getAuthRefreshToken() / setAuthRefreshToken()', () => {
        it('should return null when no refresh token stored', async () => {
            expect(await service.getAuthRefreshToken()).toBeNull();
        });

        it('should store and retrieve refresh token via localStorage in dev mode', async () => {
            await service.setAuthRefreshToken('my-refresh-token');
            expect(await service.getAuthRefreshToken()).toBe('my-refresh-token');
        });
    });

    /* SET AUTH STATE / GET AUTH STATE */
    describe('setAuthState() / getAuthState()', () => {
        it('should return false when auth state is not set', () => {
            expect(service.getAuthState()).toBe(false);
        });

        it('should return true after storing a successful login response', () => {
            const loginResponse = new LoginResponse(true, 'OK', mockUser);
            service.setAuthState(loginResponse);
            expect(service.getAuthState()).toBe(true);
        });

        it('should return false when login response has success=false', () => {
            const loginResponse = new LoginResponse(false, 'Fail', mockUser);
            service.setAuthState(loginResponse);
            expect(service.getAuthState()).toBe(false);
        });

        // simulates a corrupted localStorage entry — service must catch the JSON.parse error and return false
        it('should return false when auth state JSON is corrupted', () => {
            localStorage.setItem('authState', 'not-valid-json{{{');
            expect(service.getAuthState()).toBe(false);
        });
    });

    /* GET AUTH STATE USER */
    describe('getAuthStateUser()', () => {
        it('should return null when auth state is not set', () => {
            expect(service.getAuthStateUser()).toBeNull();
        });

        it('should return user from stored auth state', () => {
            const loginResponse = new LoginResponse(true, 'OK', mockUser);
            service.setAuthState(loginResponse);
            expect(service.getAuthStateUser()).toEqual(mockUser);
        });

        it('should return null when auth state JSON is corrupted', () => {
            localStorage.setItem('authState', 'bad-json{{{');
            expect(service.getAuthStateUser()).toBeNull();
        });
    });

    /* CLEAR AUTH DATA */
    describe('clearAuthData()', () => {
        it('should remove auth state from localStorage', async () => {
            const loginResponse = new LoginResponse(true, 'OK', mockUser);
            service.setAuthState(loginResponse);
            await service.clearAuthData();
            expect(service.getAuthState()).toBe(false);
        });

        // on web, tokens are in HTTP-only cookies managed by the browser — this service does not touch them
        it('should remove tokens from localStorage on web (not mobile)', async () => {
            platformSpy.isMobile.mockReturnValue(false);
            await service.setAuthToken('jwt');
            await service.setAuthRefreshToken('refresh');
            await service.clearAuthData();
            expect(await service.getAuthToken()).toBe('jwt');
        });

        it('should clear mobile storage when on mobile platform', async () => {
            platformSpy.isMobile.mockReturnValue(true);
            await service.setAuthToken('mobile-jwt');
            await service.setAuthRefreshToken('mobile-refresh');
            await service.clearAuthData();
            expect(await service.getAuthToken()).toBeNull();
            expect(await service.getAuthRefreshToken()).toBeNull();
        });
    });
});
