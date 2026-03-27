import { Injectable } from '@angular/core';
import { Register, UserDTO } from '../models/Register';
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
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private httpClient: HttpClient) { }

  register(userDTO: UserDTO): Observable<Object> {
    return this.httpClient.post('/api/register', userDTO);
  }

  login(login: Login): Observable<Auth> {
    return this.httpClient.post<Auth>('/api/login', login).pipe(
      tap((auth: Auth) => {
        localStorage.setItem('partialToken', auth.partialToken);
        localStorage.setItem('isAuthenticated', String(auth.isAuthenticated));
        this.isLoggedInSubject.next(auth.isAuthenticated);
      })
    );
  }

  logout(): void {
    this.httpClient.get('/api/logout').subscribe(() => {
      localStorage.removeItem('partialToken');
      localStorage.removeItem('isAuthenticated');
      this.isLoggedInSubject.next(false);
      location.replace('/login');
    });
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('isAuthenticated') === 'true';
  }


}
