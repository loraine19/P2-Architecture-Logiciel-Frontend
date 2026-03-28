import { Injectable } from '@angular/core';
import { UserDTO } from '../models/Register';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Login } from '../models/Login';
import { Auth } from '../models/Auth';
import { tap } from 'rxjs/operators';
import { UserServiceInterface } from './servicesInterfaces/userServicesInterface';

@Injectable({
  providedIn: 'root'
})
export class UserService implements UserServiceInterface {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private httpClient: HttpClient) {
    // Initialize authentication state on service creation
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const isAuth = this.isLoggedIn();
    this.isLoggedInSubject.next(isAuth);
  }

  register(userDTO: UserDTO): Observable<Object> {
    return this.httpClient.post('/api/register', userDTO);
  }

  login(login: Login): Observable<Auth> {
    return this.httpClient.post<Auth>('/api/login', login).pipe(
      tap((response: any) => {
        console.log('Login response:', response); // Debug log

        // Handle different response formats from backend
        let isAuthenticated = false;
        let partialToken = '';

        if (response.message === 'Login successful' || response.success === true) {
          // Backend returns success message - assume authenticated
          isAuthenticated = true;
          partialToken = response.partialToken || response.token || 'authenticated';
        } else if (response.isAuthenticated !== undefined) {
          // Backend returns isAuthenticated field
          isAuthenticated = response.isAuthenticated;
          partialToken = response.partialToken || '';
        }

        localStorage.setItem('partialToken', partialToken);
        localStorage.setItem('isAuthenticated', String(isAuthenticated));
        this.isLoggedInSubject.next(isAuthenticated);
        console.log('Updated auth state to:', isAuthenticated); // Debug log
      })
    );
  }

  logout(): void {
    this.httpClient.get('/api/logout').subscribe({
      next: () => {
        this.clearAuthState();
      },
      error: () => {
        // Clear auth state even if server request fails
        this.clearAuthState();
      }
    });
  }

  private clearAuthState(): void {
    localStorage.removeItem('partialToken');
    localStorage.removeItem('isAuthenticated');
    this.isLoggedInSubject.next(false);
    // Use router navigation instead of location.replace
    window.location.href = '/login';
  }

  isLoggedIn(): boolean {
    const authValue = localStorage.getItem('isAuthenticated');
    const isAuth = authValue === 'true';
    console.log('Checking localStorage auth:', { authValue, isAuth }); // Debug log
    return isAuth;
  }

  /**
   * Observable version for guards (2026 style)
   * Returns current authentication state as Observable
   */
  isAuthenticated(): Observable<boolean> {
    console.log('Current auth state from BehaviorSubject:', this.isLoggedInSubject.value); // Debug log
    return this.isLoggedIn$;
  }


}
