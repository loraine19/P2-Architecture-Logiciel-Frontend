import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AppComponent } from './app.component';

/**
 * Unit tests for AppComponent — the root application shell
 * Checks that the component boots and that the title property is set correctly
 */

describe('AppComponent', () => {

  /** TEST SETUP */
  /* beforeEach */
  // compiles the standalone component with router and HTTP providers before each test
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  });

  /** COMPONENT TESTS */
  /* APPLICATION SHELL */
  describe('Application Shell', () => {

    it('should create the app', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      expect(app).toBeTruthy();
    });

    it(`should have the 'etudiant-frontend' title`, () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      expect(app.title).toEqual('etudiant-frontend');
    });
  });
});