import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { StudentListComponent } from './studentList.component';
import { StudentService } from '../../core/service/student.service';
import { ErrorService } from '../../core/service/error.service';
import { MaterialModule } from '../../shared/material.module';
import { Student } from '../../core/models/Student';

const mockStudents: Student[] = [
    new Student(1, 'John', 'Doe', 'john@test.com', '0600000000', '1 rue Test', 'Paris', '75001'),
    new Student(2, 'Jane', 'Smith', 'jane@test.com', '0600000001', '2 rue Test', 'Lyon', '69001')
];

/**
 * Integration tests for StudentListComponent — uses the real StudentService
 * Checks component state (students, isLoading) after real intercepted HTTP responses.
 */
describe('StudentListComponent — integration (real StudentService)', () => {
    let intComponent: StudentListComponent;
    let intFixture: ComponentFixture<StudentListComponent>;
    let httpMock: HttpTestingController;

    /** TEST SETUP */
    /* beforeEach */
    // Real StudentService — ErrorService stays mocked (logic already tested in error.service.spec)
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StudentListComponent, MaterialModule],
            providers: [
                StudentService,
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([]),
                { provide: ErrorService, useValue: { handleError: jest.fn() } }
            ]
        }).compileComponents();

        intFixture = TestBed.createComponent(StudentListComponent);
        intComponent = intFixture.componentInstance;
        httpMock = TestBed.inject(HttpTestingController);
        // detectChanges() triggers ngOnInit → getAllStudents() → pending HTTP request
        intFixture.detectChanges();
    });

    afterEach(() => httpMock.verify());

    /** INTEGRATION TESTS */
    /* LOAD STUDENTS */
    // real StudentService makes the GET — checks that the component receives and displays the data
    describe('Load Students', () => {
        it('should populate students array from real HTTP GET response', () => {
            httpMock.expectOne('/api/students').flush(mockStudents);
            expect(intComponent.students.length).toBe(2);
            expect(intComponent.students[0].firstName).toBe('John');
            expect(intComponent.isLoading).toBe(false);
        });
    });

    /* DELETE FLOW */
    // real delete: HTTP DELETE + local filter on students[]
    describe('Delete Flow', () => {
        it('should update students array after real HTTP DELETE', () => {
            // initial load
            httpMock.expectOne('/api/students').flush(mockStudents);
            expect(intComponent.students.length).toBe(2);
            // trigger the two-step delete
            intComponent.deleteStudent(1);
            intComponent.confirmDelete();
            // real StudentService sends DELETE /api/students/1
            httpMock.expectOne('/api/students/1').flush(null, { status: 204, statusText: 'No Content' });
            // component removes the student without a new GET
            expect(intComponent.students.find(s => s.id === 1)).toBeUndefined();
            expect(intComponent.students.length).toBe(1);
        });
    });
});
