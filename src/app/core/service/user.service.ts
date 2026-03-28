import { Injectable } from '@angular/core';
import { UserDTO } from '../models/Register';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Login } from '../models/Login';
import { Auth } from '../models/Auth';
import { UserServiceInterface } from './servicesInterfaces/userServicesInterface';

/**
 * User authentication service implementation
 * Handles user registration, login/logout, and session management
 * Provides secure authentication state management
 */
@Injectable({
  providedIn: 'root'
})
export class UserService implements UserServiceInterface {
  private readonly apiUrl = '/api';
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private httpClient: HttpClient) {
    console.log('UserService initialized, checking existing auth state');
    this.initializeAuthState();
  }

  /**
   * Initializes authentication state from localStorage
   */
  private initializeAuthState(): void {
    const isAuth = this.isLoggedIn();
    console.log('Initializing auth state:', isAuth);
    this.isLoggedInSubject.next(isAuth);
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
   * Authenticates user with login credentials
   */
  login(login: Login): Observable<Auth> {
    console.log('Login attempt for user:', login.login);

    if (!login || !login.login || !login.password) {
      console.error('Invalid login credentials provided');
      throw new Error('Login credentials are required');
    }

    return this.httpClient.post<Auth>(`${this.apiUrl}/login`, login).pipe(
      tap((response: any) => {
        console.log('Login response received for user:', login.login);
        this.processLoginResponse(response);
      }),
      catchError(error => {
        console.error('Login failed for user:', login.login, error);
        throw error;
      })
    );
  }

  /**
   * Processes login response and updates authentication state
   */
  private processLoginResponse(response: any): void {
    let isAuthenticated = false;
    let partialToken = '';

    if (response.message === 'Login successful' || response.success === true) {
      isAuthenticated = true;
      partialToken = response.partialToken || response.token || 'authenticated';
      console.log('Authentication successful, token received');
    } else if (response.isAuthenticated !== undefined) {
      isAuthenticated = response.isAuthenticated;
      partialToken = response.partialToken || '';
      console.log('Authentication state from response:', isAuthenticated);
    }

    this.updateAuthenticationState(isAuthenticated, partialToken);
  }

  /**
   * Updates local authentication state and storage
   */
  private updateAuthenticationState(isAuthenticated: boolean, partialToken: string): void {
    localStorage.setItem('partialToken', partialToken);
    localStorage.setItem('isAuthenticated', String(isAuthenticated));
    this.isLoggedInSubject.next(isAuthenticated);
    console.log('Authentication state updated:', isAuthenticated);
  }

  /**
   * Logs out current user and clears session data
   */
  logout(): void {
    console.log('Logout initiated');

    this.httpClient.get(`${this.apiUrl}/logout`).subscribe({
      next: () => {
        console.log('Server logout successful');
        this.clearAuthState();
      },
      error: (error) => {
        console.warn('Server logout failed, clearing local auth state anyway:', error);
        this.clearAuthState();
      }
    });
  }

  /**
   * Clears authentication state and redirects to login
   */
  private clearAuthState(): void {
    console.log('Clearing authentication state');
    localStorage.removeItem('partialToken');
    localStorage.removeItem('isAuthenticated');
    this.isLoggedInSubject.next(false);
    window.location.href = '/home';
  }

  /**
   * Checks if user is currently logged in using localStorage
   */
  isLoggedIn(): boolean {
    const authValue = localStorage.getItem('isAuthenticated');
    const isAuth = authValue === 'true';
    console.log('Checking localStorage auth state:', { authValue, isAuth });
    return isAuth;
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
