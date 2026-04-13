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
 * Tests d'intégration pour LoginComponent — utilise le vrai UserService + AdaptiveStorageService
 * On vérifie l'état du localStorage après le flux complet, et non de simples appels de mock.
 * PlatformDetectionService est fourni en vrai (platform web par défaut) — Router resté mocké.
 */
describe('LoginComponent — intégration (UserService réel)', () => {
    let intComponent: LoginComponent;
    let intFixture: ComponentFixture<LoginComponent>;
    let httpMock: HttpTestingController;

    /** TEST SETUP */
    /* beforeEach */
    // UserService réel + AdaptiveStorageService réel — seul le Router et ErrorService sont mockés
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
    /* FLUX CONNEXION SUCCÈS */
    // vérifie l'état réel du localStorage — le vrai AdaptiveStorageService écrit la session
    describe('Login Flow', () => {
        it('should store auth state in localStorage after a successful login', fakeAsync(() => {
            intComponent.loginForm.setValue({ login: 'test@example.com', password: 'Password1!', rememberMe: true });
            intComponent.onSubmit();
            // le vrai UserService fait un POST; on intercepte et flushe la réponse
            httpMock.expectOne('/api/login').flush({ success: true, user: mockIntUser });
            flushMicrotasks();
            // le vrai AdaptiveStorageService a écrit dans localStorage — on lit directement
            const stored = JSON.parse(localStorage.getItem('authState')!);
            expect(stored.isLoggedIn).toBe(true);
            expect(stored.user).toEqual(mockIntUser);
            tick(2000);
        }));

        it('should NOT store auth state when login response has success=false', fakeAsync(() => {
            intComponent.loginForm.setValue({ login: 'test@example.com', password: 'Password1!', rememberMe: true });
            intComponent.onSubmit();
            // le serveur refuse la connexion — AdaptiveStorageService ne doit pas écrire en localStorage
            httpMock.expectOne('/api/login').flush({ success: false, message: 'Bad credentials', user: null });
            flushMicrotasks();
            expect(localStorage.getItem('authState')).toBeNull();
        }));
    });
});
