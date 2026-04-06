import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, from, of, throwError } from 'rxjs';
import { map, switchMap, finalize } from 'rxjs/operators';

import { UserDTO } from '../models/User';
import { MessageResponse } from '../DTO/MessageResponse';
import { Login } from '../DTO/Login';
import { LoginResponse } from '../DTO/LoginResponse';
import { AuthType } from '../DTO/AuthType';
import { UserServiceInterface } from './servicesInterfaces/userServicesInterface';
import { PlatformDetectionService } from './platformDetection.service';
import { AdaptiveStorageService } from './adaptiveStorage.service';

/**
 * Service - Handles user authentication, session management and token refresh
 * Platform-aware: uses cookies on web and JWT headers on mobile
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

  /** PUBLIC */
  /* REGISTER */
  register(userDTO: UserDTO): Observable<MessageResponse> {
    if (!userDTO?.login || !userDTO?.password) {
      throw new Error('User data is required for registration');
    }
    return this.httpClient.post<MessageResponse>(`${this.apiUrl}/register`, userDTO);
  }

  /* LOGIN */
  login(login: Login): Observable<LoginResponse> {
    if (!login?.login || !login?.password) {
      throw new Error('Login credentials are required');
    }

    const loginPayload: Login = {
      ...login,
      authType: this.platformDetection.isMobile() ? AuthType.HEADER : AuthType.COOKIE
    };

    return this.httpClient.post<LoginResponse>(`${this.apiUrl}/login`, loginPayload, { observe: 'response' }).pipe(
      switchMap((httpResponse: HttpResponse<LoginResponse>) => from(this.processLoginResponse(httpResponse)))
    );
  }

  /* LOGOUT */
  logout(): void {
    this.httpClient.post<MessageResponse>(`${this.apiUrl}/logout`, {}).pipe(
      finalize(() => {
        // cleanup always runs, even if the logout API call fails
        this.adaptiveStorage.clearAuthData();
        this.router.navigate(['/home']);
      })
    ).subscribe({
      error: (error) => console.error('Logout API call failed, but local session cleared', error)
    });
  }

  /* GET CURRENT USER */
  getCurrentUser(): UserDTO | null {
    return this.adaptiveStorage.getAuthStateUser();
  }

  /* IS LOGGED IN */
  isLoggedIn(): boolean {
    return this.adaptiveStorage.getAuthState();
  }

  /* GET AUTH TOKEN */
  async getAuthToken(): Promise<string | null> {
    return this.platformDetection.isMobile() ? await this.adaptiveStorage.getAuthToken() : null;
  }

  /* SET AUTH TOKEN */
  async setAuthToken(token: string): Promise<void> {
    if (this.platformDetection.isMobile()) {
      await this.adaptiveStorage.setAuthToken(token);
    }
  }

  /* REFRESH ACCESS TOKEN */
  refreshAccessToken(): Observable<MessageResponse> {
    const isMobile = this.platformDetection.isMobile();

    if (!isMobile) {
      return this.httpClient.post<MessageResponse>(`${this.apiUrl}/refresh`, {});
    }

    return from(this.adaptiveStorage.getAuthRefreshToken()).pipe(
      switchMap((refreshToken: string | null) => {
        if (!refreshToken) return throwError(() => new Error('No refresh token available'));

        return this.httpClient.post<MessageResponse>(
          `${this.apiUrl}/refresh`,
          { refreshToken },
          { observe: 'response' }
        );
      }),
      switchMap((httpResponse: HttpResponse<MessageResponse>) => {
        const token = this.extractTokenFromResponse(httpResponse);
        if (token) {
          return from(this.adaptiveStorage.setAuthToken(token)).pipe(
            map(() => httpResponse.body as MessageResponse)
          );
        }
        return of(httpResponse.body as MessageResponse);
      })
    );
  }

  /** PRIVATE */
  /* PROCESS LOGIN RESPONSE */
  private async processLoginResponse(httpResponse: HttpResponse<LoginResponse>): Promise<LoginResponse> {
    const response = httpResponse.body as LoginResponse;
    if (!response || !response.success) return response;

    this.adaptiveStorage.setAuthState(response);

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

  /* EXTRACT TOKEN FROM RESPONSE */
  private extractTokenFromResponse(response: HttpResponse<any>): string | null {
    const authHeader = response.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }
}