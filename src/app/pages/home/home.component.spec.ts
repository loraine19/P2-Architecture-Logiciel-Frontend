import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HomeComponent } from './home.component';
import { UserService } from '../../core/service/user.service';

/**
 * Unit tests for HomeComponent
 */
describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

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
});
