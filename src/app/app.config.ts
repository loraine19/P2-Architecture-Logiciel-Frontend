import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withDebugTracing } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { routes } from './app.routes';
import { AuthInterceptor } from './core/service/auth.interceptor';

/**
 * Application configuration providing global services and providers
 * Configures HTTP client with hybrid authentication interceptor,
 * router with debug tracing, and zone change detection
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // HTTP client with authentication interceptor for hybrid auth
    provideHttpClient(),

    // Authentication interceptor for hybrid authentication
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },

    // Zone change detection with event coalescing for performance
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Router with debug tracing enabled for development
    provideRouter(routes, withDebugTracing())
  ]
};