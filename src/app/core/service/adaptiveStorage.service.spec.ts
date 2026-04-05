import { TestBed } from '@angular/core/testing';

import { AdaptiveStorageService } from './adaptiveStorage.service';
import { PlatformDetectionService } from './platformDetection.service';
import { LoginResponse } from '../DTO/LoginResponse';
import { UserDTO } from '../models/User';

const mockUser: UserDTO = { firstName: 'John', lastName: 'Doe', login: 'john@test.com', password: '' };

/**
 * Unit tests for AdaptiveStorageService
 * DEV_MODE is true and window.SecureStorage is not defined in tests,
 * so all token operations fall back to localStorage.
 */
describe('AdaptiveStorageService', () => {
    let service: AdaptiveStorageService;
    let platformSpy: jest.Mocked<PlatformDetectionService>;

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
        localStorage.clear();
    });

    afterEach(() => localStorage.clear());

    describe('Service Initialization', () => {
        it('should be created', () => {
            expect(service).toBeTruthy();
        });
    });

    describe('getAuthToken() / setAuthToken()', () => {
        it('should return null when no token stored', async () => {
            expect(await service.getAuthToken()).toBeNull();
        });

        it('should store and retrieve auth token via localStorage in dev mode', async () => {
            await service.setAuthToken('my-jwt-token');
            expect(await service.getAuthToken()).toBe('my-jwt-token');
        });
    });

    describe('getAuthRefreshToken() / setAuthRefreshToken()', () => {
        it('should return null when no refresh token stored', async () => {
            expect(await service.getAuthRefreshToken()).toBeNull();
        });

        it('should store and retrieve refresh token via localStorage in dev mode', async () => {
            await service.setAuthRefreshToken('my-refresh-token');
            expect(await service.getAuthRefreshToken()).toBe('my-refresh-token');
        });
    });

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

        it('should return false when auth state JSON is corrupted', () => {
            localStorage.setItem('authState', 'not-valid-json{{{');
            expect(service.getAuthState()).toBe(false);
        });
    });

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

    describe('clearAuthData()', () => {
        it('should remove auth state from localStorage', async () => {
            const loginResponse = new LoginResponse(true, 'OK', mockUser);
            service.setAuthState(loginResponse);
            await service.clearAuthData();
            expect(service.getAuthState()).toBe(false);
        });

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
