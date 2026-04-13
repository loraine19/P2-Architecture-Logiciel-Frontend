import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
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
import { RegisterComponent } from './register.component';

/**
 * Tests d'intégration pour RegisterComponent — utilise le vrai UserService
 * On vérifie que les bonnes données sont envoyées à l'API et que la navigation post-succès est correcte.
 * AdaptiveStorageService est fourni en vrai — l'inscription ne stocke rien localement (pas de login auto).
 */
describe('RegisterComponent — intégration (UserService réel)', () => {
    let intComponent: RegisterComponent;
    let intFixture: ComponentFixture<RegisterComponent>;
    let httpMock: HttpTestingController;
    let intRouter: jest.Mocked<Router>;

    /** TEST SETUP */
    /* beforeEach */
    // UserService réel + AdaptiveStorageService réel — Router et ErrorService restent mockés
    beforeEach(async () => {
        const routerSpy = { navigate: jest.fn() };

        await TestBed.configureTestingModule({
            imports: [RegisterComponent, ReactiveFormsModule, MaterialModule],
            providers: [
                UserService,
                AdaptiveStorageService,
                PlatformDetectionService,
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: Router, useValue: routerSpy },
                { provide: ErrorService, useValue: { handleError: jest.fn() } },
                { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} }, queryParams: of({}) } }
            ]
        }).compileComponents();

        intFixture = TestBed.createComponent(RegisterComponent);
        intComponent = intFixture.componentInstance;
        httpMock = TestBed.inject(HttpTestingController);
        intRouter = TestBed.inject(Router) as jest.Mocked<Router>;
        intFixture.detectChanges();
    });

    afterEach(() => httpMock.verify());

    /** INTEGRATION TESTS */
    /* FLUX INSCRIPTION */
    // on vérifie le corps de la requête HTTP réelle et la navigation post-succès
    describe('Register Flow', () => {
        it('should send correct registration data to POST /api/register', fakeAsync(() => {
            const credentials = { firstName: 'John', lastName: 'Doe', login: 'test@example.com', password: 'Password123!' };
            intComponent.registerForm.setValue(credentials);
            intComponent.onSubmit();
            // vrai UserService envoie la requête — on vérifie la data transmise à l'API
            const req = httpMock.expectOne('/api/register');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(credentials);
            req.flush({ message: 'Registered' });
            tick(2000);
        }));

        it('should navigate to /login with success query params after successful registration', fakeAsync(() => {
            intComponent.registerForm.setValue({ firstName: 'John', lastName: 'Doe', login: 'test@example.com', password: 'Password123!' });
            intComponent.onSubmit();
            httpMock.expectOne('/api/register').flush({ message: 'Registered' });
            // tick(2000) avance le fake timer — la navigation est dans un setTimeout dans onSubmit()
            tick(2000);
            expect(intRouter.navigate).toHaveBeenCalledWith(
                ['/login'],
                expect.objectContaining({ queryParams: expect.objectContaining({ error: 'false' }) })
            );
        }));
    });
});
