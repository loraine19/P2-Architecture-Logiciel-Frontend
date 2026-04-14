import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { StudentCreateComponent } from './studentCreate.component';
import { StudentService } from '../../core/service/student.service';
import { ErrorService } from '../../core/service/error.service';
import { MaterialModule } from '../../shared/material.module';

/**
 * Integration tests for StudentCreateComponent — uses the real StudentService
 * Checks the HTTP request body and component state after the response.
 */
describe('StudentCreateComponent — integration (real StudentService)', () => {
    let intComponent: StudentCreateComponent;
    let intFixture: ComponentFixture<StudentCreateComponent>;
    let httpMock: HttpTestingController;

    /** TEST SETUP */
    /* beforeEach */
    // Real StudentService — ErrorService stays mocked
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StudentCreateComponent, ReactiveFormsModule, MaterialModule],
            providers: [
                StudentService,
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([]),
                { provide: ErrorService, useValue: { handleError: jest.fn() } }
            ]
        }).compileComponents();

        intFixture = TestBed.createComponent(StudentCreateComponent);
        intComponent = intFixture.componentInstance;
        httpMock = TestBed.inject(HttpTestingController);
        intFixture.detectChanges();
        // block real navigation — provideRouter([]) does not know '/studentList'
        // the goal here is to test the HTTP POST, not navigation (already tested in unit tests)
        jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    });

    afterEach(() => httpMock.verify());

    /** INTEGRATION TESTS */
    /* CREATE FLOW */
    // checks that the real StudentService sends correct data and the component reacts
    describe('Create Flow', () => {
        const intValidForm = {
            firstName: 'John', lastName: 'Doe', email: 'john@test.com',
            phoneNumber: '0600000000', address: '1 rue Test', city: 'Paris', zipCode: '75001'
        };

        it('should POST student data to /api/students via real StudentService', fakeAsync(() => {
            intComponent.studentForm.setValue(intValidForm);
            intComponent.onSubmit();
            // real StudentService builds the POST — we intercept and check the body
            const req = httpMock.expectOne('/api/students');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(intValidForm);
            req.flush({ id: 1, ...intValidForm });
            // component shows the success message before redirect
            expect(intComponent.infoMessage.error).toBe(false);
            expect(intComponent.infoMessage.message).toContain('John Doe');
            tick(2000);
        }));
    });
});
