import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { StudentListComponent } from './studentList.component';
import { StudentService } from '../../core/service/student.service';
import { ErrorService } from '../../core/service/error.service';
import { MaterialModule } from '../../shared/material.module';
import { Student } from '../../core/models/Student';

const mockStudents: Student[] = [
  new Student(1, 'John', 'Doe', 'john@test.com', '0600000000', '1 rue Test', 'Paris', '75001'),
  new Student(2, 'Jane', 'Smith', 'jane@test.com', '0600000001', '2 rue Test', 'Lyon', '69001')
];

describe('StudentListComponent', () => {
  let component: StudentListComponent;
  let fixture: ComponentFixture<StudentListComponent>;
  let studentService: jest.Mocked<StudentService>;
  let router: Router;

  beforeEach(async () => {
    const studentSpy = { getAllStudents: jest.fn(), deleteStudent: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [StudentListComponent, MaterialModule],
      providers: [
        provideRouter([]),
        { provide: StudentService, useValue: studentSpy },
        { provide: ErrorService, useValue: { handleError: jest.fn() } }
      ]
    }).compileComponents();

    studentService = TestBed.inject(StudentService) as jest.Mocked<StudentService>;
    studentService.getAllStudents.mockReturnValue(of(mockStudents));

    fixture = TestBed.createComponent(StudentListComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load students on init', () => {
      expect(studentService.getAllStudents).toHaveBeenCalled();
      expect(component.students.length).toBe(2);
    });

    it('should set isLoading to false after loading', () => {
      expect(component.isLoading).toBe(false);
    });

    it('should handle error during loading', () => {
      const errorService = TestBed.inject(ErrorService) as jest.Mocked<ErrorService>;
      errorService.handleError.mockImplementation((_err, msg) => { msg.error = true; msg.message = 'Error'; });
      studentService.getAllStudents.mockReturnValue(throwError(() => ({ status: 500 })));
      component.loadStudents();
      expect(component.isLoading).toBe(false);
      expect(component.infoMessage.error).toBe(true);
    });
  });

  describe('deleteStudent()', () => {
    it('should set pendingDeleteId', () => {
      component.deleteStudent(1);
      expect(component.pendingDeleteId).toBe(1);
    });
  });

  describe('confirmDelete()', () => {
    it('should call deleteStudent and remove from list', () => {
      studentService.deleteStudent.mockReturnValue(of(undefined));
      component.deleteStudent(1);
      component.confirmDelete();
      expect(studentService.deleteStudent).toHaveBeenCalledWith(1);
      expect(component.students.find(s => s.id === 1)).toBeUndefined();
      expect(component.infoMessage.message).toContain('deleted');
    });

    it('should do nothing when pendingDeleteId is null', () => {
      component.pendingDeleteId = null;
      component.confirmDelete();
      expect(studentService.deleteStudent).not.toHaveBeenCalled();
    });
  });

  describe('cancelDelete()', () => {
    it('should reset pendingDeleteId', () => {
      component.pendingDeleteId = 1;
      component.cancelDelete();
      expect(component.pendingDeleteId).toBeNull();
    });
  });

  describe('viewStudent()', () => {
    it('should navigate to /studentDetails/:id', () => {
      const navigateSpy = jest.spyOn(router, 'navigate');
      component.viewStudent(1);
      expect(navigateSpy).toHaveBeenCalledWith(['/studentDetails', 1]);
    });
  });

  describe('editStudent()', () => {
    it('should navigate to /studentEdit/:id', () => {
      const navigateSpy = jest.spyOn(router, 'navigate');
      component.editStudent(2);
      expect(navigateSpy).toHaveBeenCalledWith(['/studentEdit', 2]);
    });
  });
});