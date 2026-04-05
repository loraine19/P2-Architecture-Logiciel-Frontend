import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { of, throwError } from "rxjs";
import { ErrorService } from "../../core/service/error.service";
import { UserService } from "../../core/service/user.service";
import { MaterialModule } from "../../shared/material.module";
import { LoginComponent } from "./login.component";


/**
 * Unit tests for LoginComponent
 * Validates authentication logic, form constraints and navigation
 */
describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let userService: jest.Mocked<UserService>;
  let router: jest.Mocked<Router>;
  let errorService: jest.Mocked<ErrorService>;

  beforeEach(async () => {
    const userServiceSpy = { login: jest.fn() };
    const routerSpy = { navigateByUrl: jest.fn() };
    const errorServiceSpy = { handleError: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        MaterialModule,
      ],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ErrorService, useValue: errorServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParams: {} }, queryParams: of({}) }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as jest.Mocked<UserService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    errorService = TestBed.inject(ErrorService) as jest.Mocked<ErrorService>;
    fixture.detectChanges();
  });

  /** TEST SUITE */

  /* COMPONENT INITIALIZATION */
  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.loginForm).toBeDefined();
      expect(component.loginForm.get('rememberMe')?.value).toBe(true);
      expect(component.submitted).toBe(false);
    });
  });

  /* FORM VALIDATION */
  describe('Form Validation', () => {
    it('should validate required fields', () => {
      const login = component.loginForm.get('login');
      const password = component.loginForm.get('password');

      login?.setValue('');
      password?.setValue('');

      expect(login?.errors?.['required']).toBe(true);
      expect(password?.errors?.['required']).toBe(true);
    });

    it('should validate email format', () => {
      const login = component.loginForm.get('login');
      login?.setValue('invalid-email');
      expect(login?.errors?.['email']).toBe(true);
    });

    it('should validate password complexity', () => {
      const password = component.loginForm.get('password');
      password?.setValue('simple');
      expect(password?.errors?.['minlength']).toBeTruthy();

      password?.setValue('lowercase123!');
      expect(password?.errors?.['pattern']).toBeTruthy(); // No uppercase
    });
  });

  /* AUTHENTICATION FLOW */
  describe('Authentication Flow', () => {
    it('should navigate on successful login', fakeAsync(() => {
      const credentials = { login: 'test@example.com', password: 'Password123!', rememberMe: true };
      component.loginForm.setValue(credentials);
      userService.login.mockReturnValue(of({}));

      component.onSubmit();
      tick(2000); // Wait for redirect timeout

      expect(userService.login).toHaveBeenCalledWith(credentials);
      expect(router.navigateByUrl).toHaveBeenCalledWith('/studentList');
    }));

    it('should handle login failure', () => {
      component.loginForm.setValue({ login: 'test@example.com', password: 'Password123!', rememberMe: true });
      const errorResponse = { status: 401 };
      userService.login.mockReturnValue(throwError(() => errorResponse));

      component.onSubmit();

      expect(errorService.handleError).toHaveBeenCalled();
    });
  });

  /* FORM INTERACTION */
  describe('Form Interaction', () => {
    it('should toggle password visibility', () => {
      expect(component.passwordVisible).toBe(false);
      component.togglePasswordVisibility();
      expect(component.passwordVisible).toBe(true);
    });

    it('should reset form state', () => {
      component.submitted = true;
      component.onReset();
      expect(component.submitted).toBe(false);
      expect(component.loginForm.pristine).toBe(true);
    });
  });
});