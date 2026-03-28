import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withDebugTracing } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

/**
 * Application configuration providing global services and providers
 * Configures HTTP client, router with debug tracing, and zone change detection
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // HTTP client for API communications
    provideHttpClient(),

    // Zone change detection with event coalescing for performance
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Router with debug tracing enabled for development
    provideRouter(routes, withDebugTracing())
  ]
};
