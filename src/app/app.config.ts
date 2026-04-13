import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
// use DI-based interceptors so class-based interceptors (AuthInterceptor) are picked up
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { routes } from './app.routes';
import { AuthInterceptor } from './core/service/auth.interceptor';

/**
 * Application configuration - registers providers for the root injector
 * HTTP client uses DI interceptors to attach the AuthInterceptor to every request
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),

    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },

    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes)
  ]
};