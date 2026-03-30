import { Injectable } from '@angular/core';
import { UserDTO } from '../models/User';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Login } from '../models/Login';
import { UserServiceInterface } from './servicesInterfaces/userServicesInterface';
import { PlatformDetectionService } from './platform-detection.service';
import { AdaptiveStorageService } from './adaptiveStorage.service';
import { AuthType } from '../models/AuthType';
import { LoginResponse } from '../models/LoginResponse';
import { MessageResponse } from '../models/MessageResponse';
import { Router } from '@angular/router';

/**
 * User authentication service - handles login, logout, and session management
 */
@Injectable({
  providedIn: 'root'
})
export class UserService implements UserServiceInterface {
  private readonly apiUrl = '/api';

  constructor(
    private httpClient: HttpClient,
    private platformDetection: PlatformDetectionService,
    private adaptiveStorage: AdaptiveStorageService,
    private router: Router
  ) { }

  register(userDTO: UserDTO): Observable<Object> {
    if (!userDTO?.login || !userDTO?.password) {
      throw new Error('User data is required for registration');
    }
    return this.httpClient.post(`${this.apiUrl}/register`, userDTO).pipe(
      catchError(error => { throw error; })
    );
  }

  login(login: Login): Observable<LoginResponse> {
    if (!login?.login || !login?.password) {
      throw new Error('Login credentials are required');
    }

    // Add preferred auth method to the login payload instead of header
    const loginPayload: Login = {
      ...login,
      authType: this.platformDetection.isMobile() ? AuthType.HEADER : AuthType.COOKIE
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.post<LoginResponse>(`${this.apiUrl}/login`, loginPayload, { headers, observe: 'response' }).pipe(
      switchMap((httpResponse: HttpResponse<LoginResponse>) => {
        const response = httpResponse.body as LoginResponse;
        return from(this.processLoginResponse(response, httpResponse));
      }),
      catchError(error => { throw error; })
    );
  }

  logout(): void {
    this.httpClient.post<MessageResponse>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.adaptiveStorage.clearAuthData();
        this.router.navigate(['/home']);
      }),
      catchError(error => {
        this.adaptiveStorage.clearAuthData();
        this.router.navigate(['/home']);
        throw error;
      })
    ).subscribe({
      next: (response) => console.log('Logout successful:', response.message),
      error: (error) => console.error('Logout failed:', error)
    });
  }


  getCurrentUser(): UserDTO | null {
    return this.adaptiveStorage.getAuthStateUser();
  }

  isLoggedIn(): boolean {
    return this.adaptiveStorage.getAuthState();
  }

  async getAuthToken(): Promise<string | null> {
    return this.platformDetection.isMobile()
      ? await this.adaptiveStorage.getAuthToken()
      : null;
  }

  async setAuthToken(token: string): Promise<void> {
    if (this.platformDetection.isMobile()) {
      await this.adaptiveStorage.setAuthToken(token);
    }
  }

  refreshAccessToken(isMobile: boolean): Observable<LoginResponse | null> {

    // 1 Not Mobile Cookies HTTP only 
    if (!isMobile) {
      return this.httpClient.post<LoginResponse>(
        `${this.apiUrl}/refresh`,
        {},
        { observe: 'response' }
      ).pipe(
        map(response => response.body)
      );
    }

    // 2. Mobile - retrieve refresh token from adaptive storage and request new access token
    return from(this.adaptiveStorage.getAuthRefreshToken()).pipe(

      switchMap((refreshToken: string | null) => {
        if (!refreshToken) {
          return throwError(() => new Error('No refresh token available'));
        }

        return this.httpClient.post<LoginResponse>(
          `${this.apiUrl}/refresh`,
          { refreshToken },
          { observe: 'response' }
        );
      }),

      switchMap((httpResponse: HttpResponse<LoginResponse>) => {
        const token = this.extractTokenFromResponse(httpResponse);
        if (token) {
          return from(this.adaptiveStorage.setAuthToken(token)).pipe(
            map(() => httpResponse.body)
          );
        }

        return of(httpResponse.body);
      })
    );
  }


  /** PRIVATE METHODS */
  private async processLoginResponse(response: LoginResponse, httpResponse: HttpResponse<LoginResponse>): Promise<LoginResponse> {
    if (!response.success) return response;

    this.adaptiveStorage.setAuthState(response);
    console.log(response.refreshToken);
    if (response.authType === AuthType.HEADER && this.platformDetection.isMobile()) {
      if (response.refreshToken) {

        await this.adaptiveStorage.setAuthRefreshToken(response.refreshToken);
      }
      const token = this.extractTokenFromResponse(httpResponse);
      if (token) {
        await this.adaptiveStorage.setAuthToken(token);

      }
    }

    return response;
  }

  private extractTokenFromResponse(response: HttpResponse<any>): string | null {
    let token: string | null = null;
    response.headers.keys().forEach(header => {
      if (header.toLowerCase() === 'authorization') {
        const authHeader = response.headers.get(header);
        if (authHeader?.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }
    });
    return token;
  }
}
