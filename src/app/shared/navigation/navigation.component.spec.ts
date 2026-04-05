import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NavigationComponent } from './navigation.component';
import { UserService } from '../../core/service/user.service';
import { MaterialModule } from '../material.module';
import { UserDTO } from '../../core/models/User';

const mockUser: UserDTO = { firstName: 'John', lastName: 'Doe', login: 'john@test.com', password: '' };

/**
 * Unit tests for NavigationComponent
 */
describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const userSpy = {
      isLoggedIn: jest.fn().mockReturnValue(false),
      getCurrentUser: jest.fn().mockReturnValue(null),
      logout: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [NavigationComponent, MaterialModule],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: userSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as jest.Mocked<UserService>;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should start with menu closed', () => {
      expect(component.isMenuOpen).toBe(false);
    });
  });

  describe('Menu Management', () => {
    it('should open menu on toggleMenu()', () => {
      component.toggleMenu();
      expect(component.isMenuOpen).toBe(true);
    });

    it('should close menu on second toggleMenu()', () => {
      component.toggleMenu();
      component.toggleMenu();
      expect(component.isMenuOpen).toBe(false);
    });

    it('should close menu on closeMenu()', () => {
      component.isMenuOpen = true;
      component.closeMenu();
      expect(component.isMenuOpen).toBe(false);
    });
  });

  describe('Authentication Integration', () => {
    it('should return false when user is not logged in', () => {
      userService.isLoggedIn.mockReturnValue(false);
      expect(component.isAuthenticated()).toBe(false);
    });

    it('should return true when user is logged in', () => {
      userService.isLoggedIn.mockReturnValue(true);
      expect(component.isAuthenticated()).toBe(true);
    });

    it('should show welcome message when no user', () => {
      userService.getCurrentUser.mockReturnValue(null);
      expect(component.userFirstName()).toBe('Welcome in Student Management');
    });

    it('should show user first name when logged in', () => {
      userService.getCurrentUser.mockReturnValue(mockUser);
      expect(component.userFirstName()).toBe('Hi John !');
    });
  });
});
