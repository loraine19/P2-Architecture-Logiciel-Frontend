import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { StudentDetailsComponent } from './studentDetails.component';
import { StudentService } from '../../core/service/student.service';
import { ErrorService } from '../../core/service/error.service';
import { MaterialModule } from '../../shared/material.module';
import { Student } from '../../core/models/Student';

const mockStudent = new Student(1, 'John', 'Doe', 'john@test.com', '0600000000', '1 rue Test', 'Paris', '75001');

/**
 * Integration tests for StudentDetailsComponent — uses the real StudentService
 * ngOnInit loads the real student via HTTP — checks the populated form and PUT after update.
 */
describe('StudentDetailsComponent — integration (real StudentService)', () => {
    let intComponent: StudentDetailsComponent;
    let intFixture: ComponentFixture<StudentDetailsComponent>;
    let httpMock: HttpTestingController;

    /** TEST SETUP */
    /* beforeEach */
    // Real StudentService + ActivatedRoute fixed on id=1 — ErrorService stays mocked
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StudentDetailsComponent, ReactiveFormsModule, MaterialModule],
            providers: [
                StudentService,
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([]),
                { provide: ErrorService, useValue: { handleError: jest.fn() } },
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }
            ]
        }).compileComponents();

        intFixture = TestBed.createComponent(StudentDetailsComponent);
        intComponent = intFixture.componentInstance;
        httpMock = TestBed.inject(HttpTestingController);
        // detectChanges() triggers ngOnInit → loadStudent() → GET /api/students/1
        intFixture.detectChanges();
    });

    afterEach(() => httpMock.verify());

    /** INTEGRATION TESTS */
    /* LOAD STUDENT */
    // real StudentService makes the GET — checks that the form is populated with correct data
    describe('Load Student', () => {
        it('should populate form fields from real HTTP GET response', () => {
            // real StudentService intercepted — we return mockStudent
            httpMock.expectOne('/api/students/1').flush(mockStudent);
            expect(intComponent.studentForm.get('firstName')?.value).toBe('John');
            expect(intComponent.studentForm.get('email')?.value).toBe('john@test.com');
            expect(intComponent.isLoading).toBe(false);
            // form locked as read-only after load
            expect(intComponent.studentForm.disabled).toBe(true);
        });
    });

    /* UPDATE FLOW */
    // switch to edit mode, edit, submit — verify the PUT and post-update state
    describe('Update Flow', () => {
        it('should PUT updated data and refresh component.student', () => {
            httpMock.expectOne('/api/students/1').flush(mockStudent);
            // switching to edit mode unlocks the form
            intComponent.toggleEditMode();
            expect(intComponent.studentForm.disabled).toBe(false);
            // modify a field and submit
            intComponent.studentForm.get('firstName')?.setValue('Jonathan');
            intComponent.onSubmit();
            // real StudentService sends PUT /api/students/1 with updated data
            const req = httpMock.expectOne('/api/students/1');
            expect(req.request.method).toBe('PUT');
            expect(req.request.body.firstName).toBe('Jonathan');
            req.flush({ ...mockStudent, firstName: 'Jonathan' });
            // component updates student and exits edit mode
            expect(intComponent.student?.firstName).toBe('Jonathan');
            expect(intComponent.isEditMode).toBe(false);
        });
    });
});
