import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { UserService } from './user.service';
import { PlatformDetectionService } from './platformDetection.service';
import { AdaptiveStorageService } from './adaptiveStorage.service';
import { Login } from '../DTO/Login';
import { UserDTO } from '../models/User';
import { LoginResponse } from '../DTO/LoginResponse';
import { AuthType } from '../DTO/AuthType';

const mockUser: UserDTO = { firstName: 'John', lastName: 'Doe', login: 'john@test.com', password: '' };

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  let adaptiveStorage: jest.Mocked<AdaptiveStorageService>;
  let router: jest.Mocked<Router>;

  beforeEach(() => {
    const platformSpy = { isMobile: jest.fn().mockReturnValue(false) };
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

  afterEach(() => httpMock.verify());

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('register()', () => {
    it('should POST to /api/register', () => {
      const userDTO: UserDTO = { firstName: 'John', lastName: 'Doe', login: 'john@test.com', password: 'Password1!' };
      service.register(userDTO).subscribe();
      const req = httpMock.expectOne('/api/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(userDTO);
      req.flush({ message: 'Registered' });
    });

    it('should throw synchronously if login is missing', () => {
      expect(() => service.register({ firstName: 'J', lastName: 'D', password: 'P' } as any)).toThrow('User data is required for registration');
    });

    it('should throw synchronously if password is missing', () => {
      expect(() => service.register({ firstName: 'J', lastName: 'D', login: 'j@test.com' } as any)).toThrow('User data is required for registration');
    });
  });

  describe('login()', () => {
    const credentials: Login = { login: 'john@test.com', password: 'Password1!', rememberMe: false, authType: 'COOKIE' as any };

    it('should POST to /api/login', () => {
      service.login(credentials).subscribe();
      const req = httpMock.expectOne('/api/login');
      expect(req.request.method).toBe('POST');
      req.flush({ success: true, message: 'OK', user: mockUser });
    });

    it('should call setAuthState on successful login', fakeAsync(() => {
      service.login(credentials).subscribe();
      const req = httpMock.expectOne('/api/login');
      req.flush({ success: true, message: 'OK', user: mockUser });
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
      expect(() => service.login({ password: 'P' } as any)).toThrow('Login credentials are required');
    });

    it('should throw synchronously if password is missing', () => {
      expect(() => service.login({ login: 'j@test.com' } as any)).toThrow('Login credentials are required');
    });
  });

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
      httpMock.expectOne('/api/logout').error(new ErrorEvent('network error'));
      expect(adaptiveStorage.clearAuthData).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });
  });

  describe('isLoggedIn()', () => {
    it('should return false when not logged in', () => {
      adaptiveStorage.getAuthState.mockReturnValue(false);
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should return true when logged in', () => {
      adaptiveStorage.getAuthState.mockReturnValue(true);
      expect(service.isLoggedIn()).toBe(true);
    });
  });

  describe('getCurrentUser()', () => {
    it('should return null when no user in storage', () => {
      adaptiveStorage.getAuthStateUser.mockReturnValue(null);
      expect(service.getCurrentUser()).toBeNull();
    });

    it('should return the stored user', () => {
      adaptiveStorage.getAuthStateUser.mockReturnValue(mockUser);
      expect(service.getCurrentUser()).toEqual(mockUser);
    });
  });

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
  });

  describe('login() with mobile platform', () => {
    const credentials: Login = { login: 'john@test.com', password: 'Password1!', rememberMe: false, authType: 'HEADER' as any };

    it('should store refresh token when mobile login returns HEADER auth type', fakeAsync(() => {
      const platformSpy = TestBed.inject(PlatformDetectionService) as jest.Mocked<PlatformDetectionService>;
      platformSpy.isMobile.mockReturnValue(true);
      adaptiveStorage.setAuthRefreshToken.mockResolvedValue(undefined);

      service.login(credentials).subscribe();
      const req = httpMock.expectOne('/api/login');
      req.flush({ success: true, message: 'OK', user: mockUser, authType: AuthType.HEADER, refreshToken: 'ref-tok' });
      flushMicrotasks();
      expect(adaptiveStorage.setAuthRefreshToken).toHaveBeenCalledWith('ref-tok');
      expect(adaptiveStorage.setAuthState).toHaveBeenCalled();
    }));
  });
});

