import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { UserService } from './user.service';
import { PlatformDetectionService } from './platformDetection.service';
import { AdaptiveStorageService } from './adaptiveStorage.service';
import { Login } from '../DTO/Login';
import { UserDTO } from '../models/User';
import { AuthType } from '../DTO/AuthType';
import { UserErrorMessage } from '../constants/userErrorMessage';
import { LoginResponse } from '../DTO/LoginResponse';

/**
 * Unit tests for UserService — authentication, session management and token refresh
 * All HTTP calls are intercepted by HttpTestingController so no real server is needed
 * web vs mobile is tested by toggling isMobile() on the spy
 */

// shared mock user reused across multiple tests
const mockUser: UserDTO = { firstName: 'John', lastName: 'Doe', login: 'john@test.com', password: '' };

describe('UserService', () => {
  let service: UserService;
  // HttpTestingController intercepts HTTP requests and lets us assert on them without a real server
  let httpMock: HttpTestingController;
  let adaptiveStorage: jest.Mocked<AdaptiveStorageService>;
  let router: jest.Mocked<Router>;

  /** TEST SETUP */
  /* beforeEach */
  // runs before every test — creates a fresh TestBed module with all real dependencies replaced by spies
  beforeEach(() => {
    // default: web platform (isMobile = false)
    const platformSpy = { isMobile: jest.fn().mockReturnValue(false) };
    // every storage method is mocked so tests stay isolated from real storage logic
    // async methods use mockResolvedValue because they return Promises
    const storageSpy = {
      getAuthState: jest.fn().mockReturnValue(false),
      getAuthStateUser: jest.fn().mockReturnValue(null),
      setAuthState: jest.fn(),
      clearAuthData: jest.fn().mockResolvedValue(undefined),
      getAuthToken: jest.fn().mockResolvedValue(null),
      setAuthToken: jest.fn().mockResolvedValue(undefined),
      getAuthRefreshToken: jest.fn().mockResolvedValue(null),
      setAuthRefreshToken: jest.fn().mockResolvedValue(undefined)
    };
    const routerSpy = { navigate: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        UserService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PlatformDetectionService, useValue: platformSpy },
        { provide: AdaptiveStorageService, useValue: storageSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
    adaptiveStorage = TestBed.inject(AdaptiveStorageService) as jest.Mocked<AdaptiveStorageService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
  });

  // Checks that no unexpected HTTP calls were made 
  afterEach(() => httpMock.verify());



  /** SERVICE TESTS */
  /* SERVICE INITIALIZATION */
  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  /* REGISTER */
  // mirrors register -> posts user data, throws synchronously on missing fields
  describe('register()', () => {
    it('should POST to /api/register', () => {
      const userDTO: UserDTO = { firstName: 'John', lastName: 'Doe', login: 'john@test.com', password: 'Password1!' };
      service.register(userDTO).subscribe();
      // expectOne() intercepts the request and throws if the URL was not called exactly once
      const req = httpMock.expectOne('/api/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(userDTO);
      req.flush({ message: 'Registered' });
    });

    it('should throw synchronously if login is missing', () => {
      expect(() => service.register({ firstName: 'John', lastName: 'Doe', password: 'Password1' } as any)).toThrow(UserErrorMessage.MISSING_FIELDS);
    });

    it('should throw synchronously if password is missing', () => {
      expect(() => service.register({ firstName: 'John', lastName: 'Doe', login: 'john@test.com' } as any)).toThrow(UserErrorMessage.MISSING_FIELDS);
    });
  });

  /* LOGIN */
  // mirrors the login() method: posts credentials, processes response, handles errors
  describe('login()', () => {
    // default web credentials — authType COOKIE is used on web platform
    const credentials: Login = { login: 'john@test.com', password: 'Password1!', rememberMe: false, authType: 'COOKIE' as any };

    it('should POST to /api/login', () => {
      service.login(credentials).subscribe();
      const req = httpMock.expectOne('/api/login');
      expect(req.request.method).toBe('POST');
      req.flush({ success: true, user: mockUser });
    });

    it('should call setAuthState on successful login', fakeAsync(() => {
      service.login(credentials).subscribe();
      const req = httpMock.expectOne('/api/login');
      req.flush({ success: true, user: mockUser });
      // flushMicrotasks resolves all pending Promises (from async pipe operators) before asserting
      flushMicrotasks();
      expect(adaptiveStorage.setAuthState).toHaveBeenCalled();
    }));

    it('should not call setAuthState when success is false', fakeAsync(() => {
      service.login(credentials).subscribe();
      const req = httpMock.expectOne('/api/login');
      req.flush({ success: false, message: 'Invalid credentials', user: null });
      flushMicrotasks();
      expect(adaptiveStorage.setAuthState).not.toHaveBeenCalled();
    }));

    it('should throw synchronously if login field is missing', () => {
      expect(() => service.login({ password: 'Password1!' } as any)).toThrow(UserErrorMessage.MISSING_FIELDS);
    });

    it('should throw synchronously if password is missing', () => {
      expect(() => service.login({ login: 'john@test.com' } as any)).toThrow(UserErrorMessage.MISSING_FIELDS);
    });
  });

  /* LOGOUT */
  // logout uses finalize() so cleanup always runs — even when the API call fails
  describe('logout()', () => {
    it('should POST to /api/logout', () => {
      service.logout();
      const req = httpMock.expectOne('/api/logout');
      expect(req.request.method).toBe('POST');
      req.flush({});
    });

    it('should clear auth data and navigate to /home after logout', () => {
      service.logout();
      httpMock.expectOne('/api/logout').flush({});
      expect(adaptiveStorage.clearAuthData).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should still clear auth data and navigate when logout API fails', () => {
      service.logout();
      // simulate a network error — finalize() must still run
      httpMock.expectOne('/api/logout').error(new ErrorEvent('network error'));
      expect(adaptiveStorage.clearAuthData).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });
  });

  /* GET AUTH TOKEN */
  // on web, always returns null — tokens are in HTTP-only cookies, not accessible to JS
  // on mobile, reads from adaptiveStorage (Keychain/Keystore)
  describe('getAuthToken()', () => {
    it('should return null on web platform', async () => {
      const platformSpy = TestBed.inject(PlatformDetectionService) as jest.Mocked<PlatformDetectionService>;
      platformSpy.isMobile.mockReturnValue(false);
      expect(await service.getAuthToken()).toBeNull();
    });

    it('should delegate to adaptiveStorage on mobile platform', async () => {
      const platformSpy = TestBed.inject(PlatformDetectionService) as jest.Mocked<PlatformDetectionService>;
      platformSpy.isMobile.mockReturnValue(true);
      adaptiveStorage.getAuthToken.mockResolvedValue('my-token');
      expect(await service.getAuthToken()).toBe('my-token');
    });
  });

  /* SET AUTH TOKEN */
  // on web, does nothing — the browser handles cookies automatically
  // on mobile, stores the token in secure storage
  describe('setAuthToken()', () => {
    it('should not call adaptiveStorage on web platform', async () => {
      const platformSpy = TestBed.inject(PlatformDetectionService) as jest.Mocked<PlatformDetectionService>;
      platformSpy.isMobile.mockReturnValue(false);
      await service.setAuthToken('token');
      expect(adaptiveStorage.setAuthToken).not.toHaveBeenCalled();
    });

    it('should call adaptiveStorage.setAuthToken on mobile platform', async () => {
      const platformSpy = TestBed.inject(PlatformDetectionService) as jest.Mocked<PlatformDetectionService>;
      platformSpy.isMobile.mockReturnValue(true);
      await service.setAuthToken('mobile-token');
      expect(adaptiveStorage.setAuthToken).toHaveBeenCalledWith('mobile-token');
    });
  });

  /* REFRESH ACCESS TOKEN */
  // on web, a simple POST is enough — the browser sends the refresh cookie automatically
  // on mobile, the refresh token must be read from storage and sent in the request body
  describe('refreshAccessToken()', () => {
    it('should POST to /api/refresh on web platform', () => {
      const platformSpy = TestBed.inject(PlatformDetectionService) as jest.Mocked<PlatformDetectionService>;
      platformSpy.isMobile.mockReturnValue(false);
      service.refreshAccessToken().subscribe();
      const req = httpMock.expectOne('/api/refresh');
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'Refreshed' });
    });

    it('should throw error when no refresh token on mobile', fakeAsync(() => {
      const platformSpy = TestBed.inject(PlatformDetectionService) as jest.Mocked<PlatformDetectionService>;
      platformSpy.isMobile.mockReturnValue(true);
      adaptiveStorage.getAuthRefreshToken.mockResolvedValue(null);
      let error: Error | null = null;
      service.refreshAccessToken().subscribe({ error: (e) => { error = e; } });
      flushMicrotasks();
      expect(error).not.toBeNull();
    }));

    it('should send refresh token in body on mobile', fakeAsync(() => {
      const platformSpy = TestBed.inject(PlatformDetectionService) as jest.Mocked<PlatformDetectionService>;
      platformSpy.isMobile.mockReturnValue(true);
      adaptiveStorage.getAuthRefreshToken.mockResolvedValue('refresh-token');
      service.refreshAccessToken().subscribe();
      flushMicrotasks();
      const req = httpMock.expectOne('/api/refresh');
      expect(req.request.body).toEqual({ refreshToken: 'refresh-token' });
      req.flush({ message: 'Refreshed' });
    }));

    // missing branch — mobile refresh response containing a bearer token → setAuthToken called
    it('should store new access token when mobile refresh response contains Authorization bearer header', fakeAsync(() => {
      const platformSpy = TestBed.inject(PlatformDetectionService) as jest.Mocked<PlatformDetectionService>;
      platformSpy.isMobile.mockReturnValue(true);
      adaptiveStorage.getAuthRefreshToken.mockResolvedValue('refresh-token');
      adaptiveStorage.setAuthToken.mockResolvedValue(undefined);
      service.refreshAccessToken().subscribe();
      flushMicrotasks();
      const req = httpMock.expectOne('/api/refresh');
      // flush with Authorization Bearer header — extractTokenFromResponse must detect the token and call setAuthToken
      req.flush({ message: 'Refreshed' }, { headers: { Authorization: 'Bearer new-access-token' } });
      flushMicrotasks();
      expect(adaptiveStorage.setAuthToken).toHaveBeenCalledWith('new-access-token');
    }));
  });

  /* LOGIN — MOBILE PLATFORM */
  // when authType is HEADER, the server returns a refresh token that must be saved to storage
  describe('login() with mobile platform', () => {
    const credentials: Login = { login: 'john@test.com', password: 'Password1!', rememberMe: false, authType: 'HEADER' as any };

    it('should store refresh token when mobile login returns HEADER auth type', fakeAsync(() => {
      const platformSpy = TestBed.inject(PlatformDetectionService) as jest.Mocked<PlatformDetectionService>;
      platformSpy.isMobile.mockReturnValue(true);
      adaptiveStorage.setAuthRefreshToken.mockResolvedValue(undefined);

      service.login(credentials).subscribe();
      const req = httpMock.expectOne('/api/login');
      req.flush({ success: true, user: mockUser, authType: AuthType.HEADER, refreshToken: 'ref-tok' });
      flushMicrotasks();
      expect(adaptiveStorage.setAuthRefreshToken).toHaveBeenCalledWith('ref-tok');
      expect(adaptiveStorage.setAuthState).toHaveBeenCalled();
    }));

    // missing branch — response without refreshToken → setAuthRefreshToken must not be called
    it('should NOT call setAuthRefreshToken when mobile login response has no refreshToken', fakeAsync(() => {
      const platformSpy = TestBed.inject(PlatformDetectionService) as jest.Mocked<PlatformDetectionService>;
      platformSpy.isMobile.mockReturnValue(true);
      service.login(credentials).subscribe();
      const req = httpMock.expectOne('/api/login');
      // flush without refreshToken — the if (response.refreshToken) branch is false
      req.flush({ success: true, user: mockUser, authType: AuthType.HEADER });
      flushMicrotasks();
      expect(adaptiveStorage.setAuthRefreshToken).not.toHaveBeenCalled();
    }));
  });
});
