import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { StudentDetailsComponent } from './studentDetails.component';
import { StudentService } from '../../core/service/student.service';
import { ErrorService } from '../../core/service/error.service';
import { MaterialModule } from '../../shared/material.module';
import { Student } from '../../core/models/Student';
import { AppNotificationMessage } from '../../core/constants/appNotification';

/**
 * Unit tests for StudentDetailsComponent — view and edit a single student record
 * The component starts in read-only mode; isEditMode controls whether the form is enabled
 * setupWithId() reconfigures TestBed with a specific route param to test with or without an ID
 */

// shared mock student reused across multiple tests
const mockStudent = new Student(1, 'John', 'Doe', 'john@test.com', '0600000000', '1 rue Test', 'Paris', '75001');

describe('StudentDetailsComponent', () => {
  let component: StudentDetailsComponent;
  let fixture: ComponentFixture<StudentDetailsComponent>;
  let studentService: jest.Mocked<StudentService>;
  let router: Router;

  // route params are always strings in Angular — the component converts the id to a number internally
  const setupWithId = async (id: string | null = '1') => {
    const studentSpy = { getStudentById: jest.fn(), updateStudent: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [StudentDetailsComponent, ReactiveFormsModule, MaterialModule],
      providers: [
        provideRouter([]),
        { provide: StudentService, useValue: studentSpy },
        { provide: ErrorService, useValue: { handleError: jest.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => id } } }
        }
      ]
    }).compileComponents();

    studentService = TestBed.inject(StudentService) as jest.Mocked<StudentService>;
    // set return value before createComponent so ngOnInit finds data immediately
    studentService.getStudentById.mockReturnValue(of(mockStudent));

    fixture = TestBed.createComponent(StudentDetailsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  };

  /** TEST SETUP */
  /* beforeEach */
  beforeEach(async () => setupWithId('1'));

  /** COMPONENT TESTS */
  /* COMPONENT INITIALIZATION */
  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load student on init when ID is in route', () => {
      expect(studentService.getStudentById).toHaveBeenCalledWith(1);
      expect(component.student).toEqual(mockStudent);
    });

    it('should set isLoading to false after loading', () => {
      expect(component.isLoading).toBe(false);
    });

    it('should populate form with student data', () => {
      expect(component.studentForm.get('firstName')?.value).toBe('John');
      expect(component.studentForm.get('email')?.value).toBe('john@test.com');
    });

    // resetTestingModule() is needed to reinitialize TestBed with a different route param
    it('should not load student when no ID in route', async () => {
      TestBed.resetTestingModule();
      await setupWithId(null);
      expect(studentService.getStudentById).not.toHaveBeenCalled();
      expect(component.isLoading).toBe(false);
    });

    // missing branch — getStudentById fails → errorService.handleError called, isLoading=false
    it('should call errorService.handleError and set isLoading to false when getStudentById fails', () => {
      const errorService = TestBed.inject(ErrorService) as jest.Mocked<ErrorService>;
      // replace the mock with an error then call loadStudent directly
      studentService.getStudentById.mockReturnValue(throwError(() => ({ status: 404 })));
      (component as any).loadStudent();
      expect(errorService.handleError).toHaveBeenCalled();
      expect(component.isLoading).toBe(false);
    });
  });

  /* VIEW MODE */
  // form is disabled in read-only mode — toggleEditMode() enables it so the user can type
  describe('View Mode', () => {
    it('should start in view mode (form disabled)', () => {
      expect(component.isEditMode).toBe(false);
      expect(component.studentForm.disabled).toBe(true);
    });

    it('should enable form when switching to edit mode', () => {
      component.toggleEditMode();
      expect(component.isEditMode).toBe(true);
      expect(component.studentForm.disabled).toBe(false);
    });
  });

  /* ON SUBMIT */
  describe('onSubmit()', () => {
    it('should not submit when not in edit mode', () => {
      component.isEditMode = false;
      component.onSubmit();
      expect(studentService.updateStudent).not.toHaveBeenCalled();
    });

    it('should call updateStudent when form is valid', () => {
      component.toggleEditMode();
      studentService.updateStudent.mockReturnValue(of(mockStudent));
      component.onSubmit();
      expect(studentService.updateStudent).toHaveBeenCalledWith(1, expect.objectContaining({ firstName: 'John' }));
    });

    it('should show success message after update', () => {
      component.toggleEditMode();
      studentService.updateStudent.mockReturnValue(of(mockStudent));
      component.onSubmit();
      expect(component.infoMessage.error).toBe(false);
      expect(component.infoMessage.message).toBe(AppNotificationMessage.STUDENT_UPDATED('John', 'Doe'));
    });

    it('should exit edit mode after successful update', () => {
      component.toggleEditMode();
      studentService.updateStudent.mockReturnValue(of(mockStudent));
      component.onSubmit();
      expect(component.isEditMode).toBe(false);
    });

    // missing branch — updateStudent fails → errorService.handleError called
    it('should call errorService.handleError when updateStudent fails', () => {
      const errorService = TestBed.inject(ErrorService) as jest.Mocked<ErrorService>;
      component.toggleEditMode();
      studentService.updateStudent.mockReturnValue(throwError(() => ({ status: 500 })));
      component.onSubmit();
      expect(errorService.handleError).toHaveBeenCalled();
    });

    // missing branch — studentId null → early return, updateStudent not called
    it('should not call updateStudent when studentId is null', () => {
      component.toggleEditMode(); // isEditMode = true
      component.studentId = null;
      component.onSubmit();
      expect(studentService.updateStudent).not.toHaveBeenCalled();
    });
  });

  /* ON CANCEL */
  // in edit mode: discards changes and restores original values | otherwise: navigates back to the list
  describe('onCancel()', () => {
    it('should navigate to /studentList when not in edit mode', () => {
      const navigateSpy = jest.spyOn(router, 'navigate');
      component.isEditMode = false;
      component.onCancel();
      expect(navigateSpy).toHaveBeenCalledWith(['/studentList']);
    });

    it('should exit edit mode and restore form when cancelling edit', () => {
      component.toggleEditMode();
      component.studentForm.get('firstName')?.setValue('Changed');
      component.onCancel();
      expect(component.isEditMode).toBe(false);
      expect(component.studentForm.get('firstName')?.value).toBe('John');
    });
  });

  /* GO BACK TO LIST */
  describe('goBackToList()', () => {
    it('should navigate to /studentList', () => {
      const navigateSpy = jest.spyOn(router, 'navigate');
      component.goBackToList();
      expect(navigateSpy).toHaveBeenCalledWith(['/studentList']);
    });
  });
});