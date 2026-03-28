import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

/**
 * Application bootstrap entry point
 * Initializes the Angular application with the root component and configuration
 */
console.log('Starting Angular application bootstrap...');

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    console.log('✅ Angular application successfully bootstrapped');
    console.log('🚀 Student Management System is running');
  })
  .catch((err) => {
    console.error('❌ Failed to bootstrap Angular application:', err);
    console.error('Full error details:', JSON.stringify(err, null, 2));
  });
