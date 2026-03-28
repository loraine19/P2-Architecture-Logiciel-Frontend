import { Injectable } from '@angular/core';
import { UserDTO } from '../models/Register';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, from, of } from 'rxjs';
import { tap, catchError, switchMap, map } from 'rxjs/operators';
import { Login } from '../models/Login';
import { Auth } from '../models/Auth';
import { UserServiceInterface } from './servicesInterfaces/userServicesInterface';
import { PlatformDetectionService } from './platform-detection.service';
import { AdaptiveStorageService } from './adaptive-storage.service';

/**
 * User authentication service implementation with hybrid authentication
 * Supports HTTP-only cookies for web browsers and JWT secure storage for mobile
 * Handles user registration, login/logout, and session management
 * Provides secure authentication state management across platforms
 */
@Injectable({
  providedIn: 'root'
})
export class UserService implements UserServiceInterface {
  private readonly apiUrl = '/api';
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(
    private httpClient: HttpClient,
    private platformDetection: PlatformDetectionService,
    private adaptiveStorage: AdaptiveStorageService
  ) {
    console.log('UserService initialized for hybrid auth on platform:', this.platformDetection.getPlatform());
    this.initializeAuthState();
  }

  /**
   * Initializes authentication state using platform-appropriate storage
   * Uses cookies for web, secure storage for mobile
   */
  private initializeAuthState(): void {
    this.platformDetection.logPlatformInfo();

    from(this.adaptiveStorage.getAuthState()).subscribe({
      next: (isAuth) => {
        console.log('Initializing hybrid auth state:', isAuth);
        this.isLoggedInSubject.next(isAuth);
      },
      error: (error) => {
        console.error('Error initializing auth state:', error);
        this.isLoggedInSubject.next(false);
      }
    });
  }

  /**
   * Registers a new user account
   */
  register(userDTO: UserDTO): Observable<Object> {
    console.log('Registration attempt for user:', userDTO.login);

    if (!userDTO || !userDTO.login || !userDTO.password) {
      console.error('Invalid user data provided for registration');
      throw new Error('User data is required for registration');
    }

    return this.httpClient.post(`${this.apiUrl}/register`, userDTO).pipe(
      tap(() => console.log('User registered successfully:', userDTO.login)),
      catchError(error => {
        console.error('Registration failed for user:', userDTO.login, error);
        throw error;
      })
    );
  }

  /**
   * Authenticates user with login credentials using hybrid authentication
   * Web: Uses HTTP-only cookies, Mobile: Uses JWT with secure storage
   */
  login(login: Login): Observable<Auth> {
    console.log('Hybrid login attempt for user:', login.login, 'Platform:', this.platformDetection.getPlatform());

    if (!login || !login.login || !login.password) {
      console.error('Invalid login credentials provided');
      throw new Error('Login credentials are required');
    }

    // Build headers to indicate platform preference
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Platform': this.platformDetection.getPlatform(),
      'X-Auth-Type': this.platformDetection.isMobile() ? 'jwt' : 'cookie'
    });

    return this.httpClient.post<Auth>(`${this.apiUrl}/login`, login, { headers }).pipe(
      switchMap((response: any) => {
        console.log('Login response received for user:', login.login);
        return from(this.processHybridLoginResponse(response));
      }),
      catchError(error => {
        console.error('Login failed for user:', login.login, error);
        throw error;
      })
    );
  }

  /**
   * Processes hybrid login response and updates authentication state
   * Handles both JWT (mobile) and cookie (web) authentication
   */
  private async processHybridLoginResponse(response: any): Promise<Auth> {
    let isAuthenticated = false;
    let token = '';

    // Parse response based on success patterns
    if (response.message === 'Login successful' || response.success === true) {
      isAuthenticated = true;
      token = response.token || response.jwt || response.partialToken || '';
      console.log('Authentication successful, platform:', this.platformDetection.getPlatform());
    } else if (response.isAuthenticated !== undefined) {
      isAuthenticated = response.isAuthenticated;
      token = response.token || response.jwt || response.partialToken || '';
      console.log('Authentication state from response:', isAuthenticated);
    }

    // Store authentication data using platform-appropriate method
    if (isAuthenticated) {
      await this.adaptiveStorage.storeAuthToken(token, isAuthenticated);
      this.isLoggedInSubject.next(true);
      console.log('Hybrid authentication state updated successfully');
    } else {
      await this.adaptiveStorage.clearAuthData();
      this.isLoggedInSubject.next(false);
      console.log('Authentication failed, cleared state');
    }

    return response;
  }

  /**
   * Logs out current user using hybrid authentication
   * Clears cookies (web) or secure storage (mobile)
   */
  logout(): void {
    console.log('Hybrid logout initiated, platform:', this.platformDetection.getPlatform());

    // Build headers to indicate platform and logout type
    const headers = new HttpHeaders({
      'X-Platform': this.platformDetection.getPlatform(),
      'X-Auth-Type': this.platformDetection.isMobile() ? 'jwt' : 'cookie'
    });

    this.httpClient.post(`${this.apiUrl}/logout`, {}, { headers }).subscribe({
      next: () => {
        console.log('Server logout successful');
        this.clearHybridAuthState();
      },
      error: (error) => {
        console.warn('Server logout failed, clearing local auth state anyway:', error);
        this.clearHybridAuthState();
      }
    });
  }

  /**
   * Clears authentication state using platform-appropriate method
   */
  private clearHybridAuthState(): void {
    console.log('Clearing hybrid authentication state');

    from(this.adaptiveStorage.clearAuthData()).subscribe({
      next: () => {
        this.isLoggedInSubject.next(false);
        console.log('Hybrid auth state cleared successfully');
        window.location.href = '/home';
      },
      error: (error) => {
        console.error('Error clearing auth state:', error);
        this.isLoggedInSubject.next(false);
        window.location.href = '/home';
      }
    });
  }

  /**
   * Checks if user is currently logged in using hybrid storage
   * @returns {Observable<boolean>} Authentication state observable
   */
  isLoggedIn(): boolean {
    // For synchronous calls, return current subject value
    // For proper async handling, components should use isLoggedIn$ observable
    const currentState = this.isLoggedInSubject.value;
    console.log('Checking current auth state (sync):', currentState);
    return currentState;
  }

  /**
   * Asynchronously checks authentication state using hybrid storage
   * @returns {Observable<boolean>} Authentication state observable
   */
  checkAuthState(): Observable<boolean> {
    return from(this.adaptiveStorage.getAuthState()).pipe(
      tap(isAuth => {
        console.log('Hybrid auth state check result:', isAuth);
        this.isLoggedInSubject.next(isAuth);
      }),
      catchError(error => {
        console.error('Error checking auth state:', error);
        this.isLoggedInSubject.next(false);
        return of(false);
      })
    );
  }

  /**
   * Gets authentication token for API requests (mobile only)
   * @returns {Promise<string | null>} Token for mobile, null for web
   */
  async getAuthToken(): Promise<string | null> {
    if (this.platformDetection.isMobile()) {
      return await this.adaptiveStorage.getAuthToken();
    }
    return null; // Web uses HTTP-only cookies
  }



  /**
   * Returns authentication state as Observable for reactive components
   * Used by guards and components for real-time auth state updates
   */
  isAuthenticated(): Observable<boolean> {
    const currentState = this.isLoggedInSubject.value;
    console.log('Providing auth observable, current state:', currentState);
    return this.isLoggedIn$;
  }
}
