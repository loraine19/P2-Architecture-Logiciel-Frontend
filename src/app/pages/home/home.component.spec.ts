import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HomeComponent } from './home.component';
import { UserService } from '../../core/service/user.service';

/**
 * Unit tests for HomeComponent — static landing page with tech stack data
 * All data is declared inline in the component so no HTTP calls are needed
 */

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  /** TEST SETUP */
  /* beforeEach */
  // provideRouter([]) is needed because the template uses RouterLink
  beforeEach(async () => {
    const userSpy = { isLoggedIn: jest.fn().mockReturnValue(false) };

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: userSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /** COMPONENT TESTS */
  /* COMPONENT INITIALIZATION */
  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should expose frontend tech stack', () => {
      expect(component.techStackFrontend.length).toBeGreaterThan(0);
      expect(component.techStackFrontend).toContain('Angular 18 (Standalone)');
    });

    it('should expose backend tech stack', () => {
      expect(component.techStackBackend.length).toBeGreaterThan(0);
      expect(component.techStackBackend).toContain('Java 21 & Spring Boot 3');
    });

    it('should expose features list', () => {
      expect(component.features.length).toBeGreaterThan(0);
      expect(component.features[0]).toHaveProperty('icon');
      expect(component.features[0]).toHaveProperty('title');
    });
  });

  /* IS LOGGED IN */
  describe('isLoggedIn()', () => {
    it('should return false when user is not logged in', () => {
      expect(component.isLoggedIn()).toBe(false);
    });
  });
});
