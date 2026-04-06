import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { of, throwError } from "rxjs";
import { ErrorService } from "../../core/service/error.service";
import { UserService } from "../../core/service/user.service";
import { MaterialModule } from "../../shared/material.module";
import { RegisterComponent } from "./register.component";


describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let userService: jest.Mocked<UserService>;
  let router: jest.Mocked<Router>;
  let errorService: jest.Mocked<ErrorService>;

  beforeEach(async () => {
    const userServiceSpy = { register: jest.fn(), login: jest.fn() };
    const routerSpy = { navigate: jest.fn() };
    const errorServiceSpy = { handleError: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
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

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as jest.Mocked<UserService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    errorService = TestBed.inject(ErrorService) as jest.Mocked<ErrorService>;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.registerForm).toBeDefined();
      expect(component.registerForm.get('login')?.value).toBe('');
      expect(component.submitted).toBe(false);
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', () => {

      const firstName = component.registerForm.get('firstName');
      const lastName = component.registerForm.get('lastName');
      const login = component.registerForm.get('login');
      const password = component.registerForm.get('password');

      firstName?.setValue('');
      lastName?.setValue('');
      login?.setValue('');
      password?.setValue('');

      expect(firstName?.errors?.['required']).toBe(true);
      expect(lastName?.errors?.['required']).toBe(true);
      expect(login?.errors?.['required']).toBe(true);
      expect(password?.errors?.['required']).toBe(true);
    });
  });


  describe('Authentication Flow', () => {
    it('should navigate on successful login', fakeAsync(() => {
      const credentials = { firstName: 'John', lastName: 'Doe', login: 'test@example.com', password: 'Password123!' };
      component.registerForm.setValue(credentials);
      userService.register.mockReturnValue(of({ message: '' }));

      component.onSubmit();
      tick(2000); // Wait for redirect timeout

      expect(userService.register).toHaveBeenCalledWith(credentials);
      expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { msg: 'Registration successful! Please log in.', error: 'false' } });
    }));

    it('should handle login failure', () => {
      component.registerForm.setValue({ firstName: 'John', lastName: 'Doe', login: 'test@example.com', password: 'Password123!' });
      const errorResponse = { status: 401 };
      userService.register.mockReturnValue(throwError(() => errorResponse));

      component.onSubmit();

      expect(errorService.handleError).toHaveBeenCalled();
    });
  });

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
      expect(component.registerForm.pristine).toBe(true);
    });
  });
});