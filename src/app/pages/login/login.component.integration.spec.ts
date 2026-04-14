import { ComponentFixture, TestBed, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ErrorService } from '../../core/service/error.service';
import { UserService } from '../../core/service/user.service';
import { AdaptiveStorageService } from '../../core/service/adaptiveStorage.service';
import { PlatformDetectionService } from '../../core/service/platformDetection.service';
import { MaterialModule } from '../../shared/material.module';
import { LoginComponent } from './login.component';
import { UserDTO } from '../../core/models/User';

// shared mock user for integration tests
const mockIntUser: UserDTO = { firstName: 'John', lastName: 'Doe', login: 'test@example.com', password: '' };

/**
 * Integration tests for LoginComponent — uses the real UserService + AdaptiveStorageService
 * Checks the localStorage state after the full flow, not just mock calls.
 * PlatformDetectionService is provided as real (web platform by default) — Router stays mocked.
 */
describe('LoginComponent — integration (real UserService)', () => {
    let intComponent: LoginComponent;
    let intFixture: ComponentFixture<LoginComponent>;
    let httpMock: HttpTestingController;

    /** TEST SETUP */
    /* beforeEach */
    // Real UserService + real AdaptiveStorageService — only Router and ErrorService are mocked
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LoginComponent, ReactiveFormsModule, MaterialModule],
            providers: [
                UserService,
                AdaptiveStorageService,
                PlatformDetectionService,
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: Router, useValue: { navigateByUrl: jest.fn() } },
                { provide: ErrorService, useValue: { handleError: jest.fn() } },
                { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} }, queryParams: of({}) } }
            ]
        }).compileComponents();

        intFixture = TestBed.createComponent(LoginComponent);
        intComponent = intFixture.componentInstance;
        httpMock = TestBed.inject(HttpTestingController);
        intFixture.detectChanges();
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
    });

    /** INTEGRATION TESTS */
    /* LOGIN SUCCESS FLOW */
    // checks real localStorage state — real AdaptiveStorageService writes the session
    describe('Login Flow', () => {
        it('should store auth state in localStorage after a successful login', fakeAsync(() => {
            intComponent.loginForm.setValue({ login: 'test@example.com', password: 'Password1!', rememberMe: true });
            intComponent.onSubmit();
            // real UserService makes a POST; we intercept and flush the response
            httpMock.expectOne('/api/login').flush({ success: true, user: mockIntUser });
            flushMicrotasks();
            // real AdaptiveStorageService has written to localStorage — we read it directly
            const stored = JSON.parse(localStorage.getItem('authState')!);
            expect(stored.isLoggedIn).toBe(true);
            expect(stored.user).toEqual(mockIntUser);
            tick(2000);
        }));

        it('should NOT store auth state when login response has success=false', fakeAsync(() => {
            intComponent.loginForm.setValue({ login: 'test@example.com', password: 'Password1!', rememberMe: true });
            intComponent.onSubmit();
            // server rejects the login — AdaptiveStorageService must not write to localStorage
            httpMock.expectOne('/api/login').flush({ success: false, message: 'Bad credentials', user: null });
            flushMicrotasks();
            expect(localStorage.getItem('authState')).toBeNull();
        }));
    });
});
