import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { StudentService } from './student.service';
import { Student, StudentDto } from '../models/Student';

const mockStudent: Student = new Student(1, 'John', 'Doe', 'john@test.com', '0600000000', '1 rue Test', 'Paris', '75001');
const mockStudents: Student[] = [
    mockStudent,
    new Student(2, 'Jane', 'Smith', 'jane@test.com', '0600000001', '2 rue Test', 'Lyon', '69001')
];
const mockStudentDto: StudentDto = { firstName: 'John', lastName: 'Doe', email: 'john@test.com', phoneNumber: '0600000000', address: '1 rue Test', city: 'Paris', zipCode: '75001' };

describe('StudentService', () => {
    let service: StudentService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [StudentService, provideHttpClient(), provideHttpClientTesting()]
        });
        service = TestBed.inject(StudentService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    describe('Service Initialization', () => {
        it('should be created', () => {
            expect(service).toBeTruthy();
        });
    });

    describe('getAllStudents()', () => {
        it('should GET /api/students and return all students', () => {
            service.getAllStudents().subscribe(students => {
                expect(students.length).toBe(2);
                expect(students).toEqual(mockStudents);
            });
            const req = httpMock.expectOne('/api/students');
            expect(req.request.method).toBe('GET');
            req.flush(mockStudents);
        });

        it('should return an empty array when no students', () => {
            service.getAllStudents().subscribe(students => {
                expect(students).toEqual([]);
            });
            httpMock.expectOne('/api/students').flush([]);
        });
    });

    describe('getStudentById()', () => {
        it('should GET /api/students/:id and return a student', () => {
            service.getStudentById(1).subscribe(student => {
                expect(student).toEqual(mockStudent);
            });
            const req = httpMock.expectOne('/api/students/1');
            expect(req.request.method).toBe('GET');
            req.flush(mockStudent);
        });

        it('should propagate 404 error when student not found', () => {
            let error: any;
            service.getStudentById(999).subscribe({ error: (e) => (error = e) });
            httpMock.expectOne('/api/students/999').flush('Not Found', { status: 404, statusText: 'Not Found' });
            expect(error.status).toBe(404);
        });
    });

    describe('createStudent()', () => {
        it('should POST to /api/students and return created student', () => {
            service.createStudent(mockStudentDto).subscribe(student => {
                expect(student).toEqual(mockStudent);
            });
            const req = httpMock.expectOne('/api/students');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(mockStudentDto);
            req.flush(mockStudent);
        });
    });

    describe('updateStudent()', () => {
        it('should PUT to /api/students/:id and return updated student', () => {
            const updated = { ...mockStudentDto, firstName: 'Jonathan' };
            service.updateStudent(1, updated).subscribe(student => {
                expect(student.firstName).toBe('Jonathan');
            });
            const req = httpMock.expectOne('/api/students/1');
            expect(req.request.method).toBe('PUT');
            expect(req.request.body).toEqual(updated);
            req.flush({ ...mockStudent, firstName: 'Jonathan' });
        });
    });

    describe('deleteStudent()', () => {
        it('should DELETE /api/students/:id', () => {
            service.deleteStudent(1).subscribe();
            const req = httpMock.expectOne('/api/students/1');
            expect(req.request.method).toBe('DELETE');
            req.flush(null, { status: 204, statusText: 'No Content' });
        });

        it('should propagate error when delete fails', () => {
            let error: any;
            service.deleteStudent(999).subscribe({ error: (e) => (error = e) });
            httpMock.expectOne('/api/students/999').flush('Not Found', { status: 404, statusText: 'Not Found' });
            expect(error.status).toBe(404);
        });
    });
});
