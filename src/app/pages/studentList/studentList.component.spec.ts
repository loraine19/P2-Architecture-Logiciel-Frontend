import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { StudentListComponent } from './studentList.component';
import { StudentService } from '../../core/service/student.service';
import { ErrorService } from '../../core/service/error.service';
import { MaterialModule } from '../../shared/material.module';
import { Student } from '../../core/models/Student';
import { AppNotification } from '../../core/constants/appNotification';

/**
 * Unit tests for StudentListComponent — student list with a two-step delete confirmation flow
 * StudentService is mocked so no real HTTP calls are made
 */

// shared mock students reused across multiple tests
const mockStudents: Student[] = [
  new Student(1, 'John', 'Doe', 'john@test.com', '0600000000', '1 rue Test', 'Paris', '75001'),
  new Student(2, 'Jane', 'Smith', 'jane@test.com', '0600000001', '2 rue Test', 'Lyon', '69001')
];

describe('StudentListComponent', () => {
  let component: StudentListComponent;
  let fixture: ComponentFixture<StudentListComponent>;
  let studentService: jest.Mocked<StudentService>;
  let router: Router;

  /** TEST SETUP */
  /* beforeEach */
  // mocks StudentService and creates the component — getAllStudents fires automatically on ngOnInit
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
    // set return value before createComponent so ngOnInit finds data immediately
    studentService.getAllStudents.mockReturnValue(of(mockStudents));

    fixture = TestBed.createComponent(StudentListComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  /** COMPONENT TESTS */
  /* COMPONENT INITIALIZATION */
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

  /* DELETE STUDENT */
  // stores the id to delete so the template can show a confirmation dialog before calling the API
  describe('deleteStudent()', () => {
    it('should set pendingDeleteId', () => {
      component.deleteStudent(1);
      expect(component.pendingDeleteId).toBe(1);
    });
  });

  /* CONFIRM DELETE */
  describe('confirmDelete()', () => {
    it('should call deleteStudent and remove from list', () => {
      studentService.deleteStudent.mockReturnValue(of(undefined));
      component.deleteStudent(1);
      component.confirmDelete();
      expect(studentService.deleteStudent).toHaveBeenCalledWith(1);
      expect(component.students.find(s => s.id === 1)).toBeUndefined();
      expect(component.infoMessage.message).toBe(AppNotification.STUDENT_DELETED);
    });

    it('should do nothing when pendingDeleteId is null', () => {
      component.pendingDeleteId = null;
      component.confirmDelete();
      expect(studentService.deleteStudent).not.toHaveBeenCalled();
    });

    // missing branch — deleteStudent fails → errorService.handleError called, pendingDeleteId reset to null
    it('should call errorService.handleError and reset pendingDeleteId when delete fails', () => {
      const errorService = TestBed.inject(ErrorService) as jest.Mocked<ErrorService>;
      studentService.deleteStudent.mockReturnValue(throwError(() => ({ status: 500 })));
      component.deleteStudent(1);
      component.confirmDelete();
      expect(errorService.handleError).toHaveBeenCalled();
      expect(component.pendingDeleteId).toBeNull();
    });
  });

  /* CANCEL DELETE */
  describe('cancelDelete()', () => {
    it('should reset pendingDeleteId', () => {
      component.pendingDeleteId = 1;
      component.cancelDelete();
      expect(component.pendingDeleteId).toBeNull();
    });

    // missing branch — cancelDelete also resets infoMessage to empty
    it('should reset infoMessage when cancelling delete', () => {
      component.infoMessage = { message: 'Deletion cancelled', error: true };
      component.cancelDelete();
      expect(component.infoMessage).toEqual({ message: '', error: false });
    });
  });

  /* VIEW STUDENT */
  describe('viewStudent()', () => {
    it('should navigate to /studentDetails/:id', () => {
      const navigateSpy = jest.spyOn(router, 'navigate');
      component.viewStudent(1);
      expect(navigateSpy).toHaveBeenCalledWith(['/studentDetails', 1]);
    });
  });

  /* EDIT STUDENT */
  describe('editStudent()', () => {
    it('should navigate to /studentEdit/:id', () => {
      const navigateSpy = jest.spyOn(router, 'navigate');
      component.editStudent(2);
      expect(navigateSpy).toHaveBeenCalledWith(['/studentEdit', 2]);
    });
  });
});