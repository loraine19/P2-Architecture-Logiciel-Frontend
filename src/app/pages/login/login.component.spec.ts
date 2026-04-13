import { ComponentFixture, TestBed, fakeAsync, tick, flushMicrotasks } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { of, throwError, Subject } from "rxjs";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { ErrorService } from "../../core/service/error.service";
import { UserService } from "../../core/service/user.service";
import { AdaptiveStorageService } from "../../core/service/adaptiveStorage.service";
import { PlatformDetectionService } from "../../core/service/platformDetection.service";
import { LoginResponse } from "../../core/DTO/LoginResponse";
import { MaterialModule } from "../../shared/material.module";
import { LoginComponent } from "./login.component";
import { UserDTO } from "../../core/models/User";
/**
 * Unit tests for LoginComponent — login form validation and authentication flow
 * UserService and ErrorService are replaced with spies so no real HTTP calls are made
 */
describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let userService: jest.Mocked<UserService>;
  let router: jest.Mocked<Router>;
  let errorService: jest.Mocked<ErrorService>;

  /** TEST SETUP */
  /* beforeEach */
  // builds the form and injects all required mocks before each test
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

  /** COMPONENT TESTS */
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
      const credentials = {
        login: 'test@example.com',
        password: 'Password123!',
        rememberMe: true
      };
      component.loginForm.setValue(credentials);
      userService.login.mockReturnValue(of({ message: '', success: true, user: {} } as LoginResponse));

      component.onSubmit();
      // tick(5000) advances the fake timer — the redirect runs inside a setTimeout(5000) in the component
      tick(5000); // Wait for redirect timeout

      expect(userService.login).toHaveBeenCalledWith(credentials);
      expect(router.navigateByUrl).toHaveBeenCalledWith('/studentList');
    }));

    // CORRECTION : branche erreur non testée — succès login → infoMessage affiché avant la redirection
    it('should show welcome message with login email after successful login', fakeAsync(() => {
      component.loginForm.setValue({ login: 'test@example.com', password: 'Password123!', rememberMe: true });
      userService.login.mockReturnValue(of({ message: '', success: true, user: {} } as LoginResponse));
      component.onSubmit();
      // le message doit être visible immédiatement avant que le setTimeout redirige
      expect(component.infoMessage.message).toContain('test@example.com');
      expect(component.infoMessage.error).toBe(false);
      tick(2000);
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

    // CORRECTION : branche erreur non testée — formulaire invalide → submitted=true mais login() non appelé
    it('should set submitted to true and not call login when form is invalid', () => {
      // le formulaire est vide (invalide) par défaut à l'initialisation
      component.onSubmit();
      expect(component.submitted).toBe(true);
      expect(userService.login).not.toHaveBeenCalled();
    });
  });

  /* QUERY PARAMS */
  // checkQueryParams() lit les params msg et error passés par register ou une session expirée
  describe('Query Params', () => {
    let params$: Subject<any>;
    let comp: LoginComponent;
    let fix: ComponentFixture<LoginComponent>;

    // setup dédié avec un Subject contrôlable pour queryParams
    beforeEach(async () => {
      TestBed.resetTestingModule();
      params$ = new Subject();

      await TestBed.configureTestingModule({
        imports: [LoginComponent, ReactiveFormsModule, MaterialModule],
        providers: [
          { provide: UserService, useValue: { login: jest.fn() } },
          { provide: Router, useValue: { navigateByUrl: jest.fn() } },
          { provide: ErrorService, useValue: { handleError: jest.fn() } },
          {
            provide: ActivatedRoute,
            useValue: { snapshot: { queryParams: {} }, queryParams: params$ }
          }
        ]
      }).compileComponents();

      fix = TestBed.createComponent(LoginComponent);
      comp = fix.componentInstance;
      // ngOnInit s'exécute ici — la subscription à queryParams est enregistrée
      fix.detectChanges();
    });

    // CORRECTION : branche erreur non testée — query param msg présent avec error='false' → infoMessage affiché
    it('should set infoMessage from query params with error=false', () => {
      params$.next({ msg: 'Registration successful!', error: 'false' });
      expect(comp.infoMessage.message).toBe('Registration successful!');
      expect(comp.infoMessage.error).toBe(false);
    });

    // CORRECTION : branche erreur non testée — query param error='true' → infoMessage.error=true
    it('should set infoMessage.error to true when error query param is true', () => {
      params$.next({ msg: 'Session expired', error: 'true' });
      expect(comp.infoMessage.message).toBe('Session expired');
      expect(comp.infoMessage.error).toBe(true);
    });
  });
});