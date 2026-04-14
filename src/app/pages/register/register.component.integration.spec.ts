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
 * Integration tests for RegisterComponent — uses the real UserService
 * Checks that the correct data is sent to the API and that post-success navigation is correct.
 * AdaptiveStorageService is provided as real — registration stores nothing locally (no auto-login).
 */
describe('RegisterComponent — integration (real UserService)', () => {
    let intComponent: RegisterComponent;
    let intFixture: ComponentFixture<RegisterComponent>;
    let httpMock: HttpTestingController;
    let intRouter: jest.Mocked<Router>;

    /** TEST SETUP */
    /* beforeEach */
    // Real UserService + real AdaptiveStorageService — Router and ErrorService stay mocked
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
    /* REGISTER FLOW */
    // checks the real HTTP request body and post-success navigation
    describe('Register Flow', () => {
        it('should send correct registration data to POST /api/register', fakeAsync(() => {
            const credentials = { firstName: 'John', lastName: 'Doe', login: 'test@example.com', password: 'Password123!' };
            intComponent.registerForm.setValue(credentials);
            intComponent.onSubmit();
            // real UserService sends the request — we check the data sent to the API
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
            // tick(2000) advances the fake timer — navigation is inside a setTimeout in onSubmit()
            tick(2000);
            expect(intRouter.navigate).toHaveBeenCalledWith(
                ['/login'],
                expect.objectContaining({ queryParams: expect.objectContaining({ error: 'false' }) })
            );
        }));
    });
});
