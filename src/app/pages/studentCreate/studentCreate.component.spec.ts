import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { StudentCreateComponent } from './studentCreate.component';
import { StudentService } from '../../core/service/student.service';
import { ErrorService } from '../../core/service/error.service';
import { MaterialModule } from '../../shared/material.module';
import { Student } from '../../core/models/Student';
import { AppNotificationMessage } from '../../core/constants/appNotification';

/**
 * Unit tests for StudentCreateComponent — student creation form and post-submit redirect
 * StudentService is mocked so no real HTTP calls are made
 */

describe('StudentCreateComponent', () => {
  let component: StudentCreateComponent;
  let fixture: ComponentFixture<StudentCreateComponent>;
  let studentService: jest.Mocked<StudentService>;
  let router: Router;

  // reusable valid form data — matches all field validators
  const validForm = {
    firstName: 'John', lastName: 'Doe', email: 'john@test.com',
    phoneNumber: '0600000000', address: '1 rue Test', city: 'Paris', zipCode: '75001'
  };

  /** TEST SETUP */
  /* beforeEach */
  // builds the form and injects a mocked StudentService before each test
  beforeEach(async () => {
    const studentSpy = { createStudent: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [StudentCreateComponent, ReactiveFormsModule, MaterialModule],
      providers: [
        provideRouter([]),
        { provide: StudentService, useValue: studentSpy },
        { provide: ErrorService, useValue: { handleError: jest.fn() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentCreateComponent);
    component = fixture.componentInstance;
    studentService = TestBed.inject(StudentService) as jest.Mocked<StudentService>;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  /** COMPONENT TESTS */
  /* COMPONENT INITIALIZATION */
  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with empty values', () => {
      expect(component.studentForm.get('firstName')?.value).toBe('');
      expect(component.studentForm.get('lastName')?.value).toBe('');
      expect(component.studentForm.get('email')?.value).toBe('');
    });

    it('should start with submitted as false', () => {
      expect(component.submitted).toBe(false);
    });

    it('should start with invalid form', () => {
      expect(component.studentForm.invalid).toBe(true);
    });
  });

  /* FORM VALIDATION */
  describe('Form Validation', () => {
    it('should require firstName', () => {
      component.studentForm.get('firstName')?.setValue('');
      expect(component.studentForm.get('firstName')?.errors?.['required']).toBeTruthy();
    });

    it('should require lastName', () => {
      component.studentForm.get('lastName')?.setValue('');
      expect(component.studentForm.get('lastName')?.errors?.['required']).toBeTruthy();
    });

    it('should require a valid email', () => {
      component.studentForm.get('email')?.setValue('not-an-email');
      expect(component.studentForm.get('email')?.errors?.['email']).toBeTruthy();
    });

    it('should require email', () => {
      component.studentForm.get('email')?.setValue('');
      expect(component.studentForm.get('email')?.errors?.['required']).toBeTruthy();
    });

    it('should require address', () => {
      component.studentForm.get('address')?.setValue('');
      expect(component.studentForm.get('address')?.errors?.['required']).toBeTruthy();
    });

    it('should require zipCode to be 5 digits', () => {
      component.studentForm.get('zipCode')?.setValue('123');
      expect(component.studentForm.get('zipCode')?.errors?.['pattern']).toBeTruthy();
    });

    it('should be valid with all correct values', () => {
      component.studentForm.setValue(validForm);
      expect(component.studentForm.valid).toBe(true);
    });
  });

  /* ON SUBMIT */
  describe('onSubmit()', () => {
    it('should not call createStudent when form is invalid', () => {
      component.onSubmit();
      expect(studentService.createStudent).not.toHaveBeenCalled();
    });

    it('should set submitted to true on submit', () => {
      component.onSubmit();
      expect(component.submitted).toBe(true);
    });

    it('should call createStudent with form values when valid', () => {
      component.studentForm.setValue(validForm);
      const createdStudent = { id: 1, ...validForm };
      studentService.createStudent.mockReturnValue(of(createdStudent as any));
      component.onSubmit();
      expect(studentService.createStudent).toHaveBeenCalledWith(validForm);
    });

    it('should show success message after creation', () => {
      component.studentForm.setValue(validForm);
      studentService.createStudent.mockReturnValue(of({ id: 1, ...validForm } as any));
      component.onSubmit();
      expect(component.infoMessage.error).toBe(false);
      expect(component.infoMessage.message).toBe(AppNotificationMessage.STUDENT_CREATED('John', 'Doe'));
    });

    it('should navigate to /studentList after 2s on success', fakeAsync(() => {
      const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
      component.studentForm.setValue(validForm);
      studentService.createStudent.mockReturnValue(of({ id: 1, ...validForm } as any));
      component.onSubmit();
      // tick(2000) advances the fake timer — the redirect runs inside a setTimeout in onSubmit()
      tick(2000);
      expect(navigateSpy).toHaveBeenCalledWith(['/studentList']);
    }));

    // CORRECTION : branche erreur non testée — createStudent échoue → errorService.handleError appelé
    it('should call errorService.handleError when createStudent fails', () => {
      const errorService = TestBed.inject(ErrorService) as jest.Mocked<ErrorService>;
      component.studentForm.setValue(validForm);
      studentService.createStudent.mockReturnValue(throwError(() => ({ status: 500 })));
      component.onSubmit();
      expect(errorService.handleError).toHaveBeenCalled();
    });
  });

  /* ON RESET */
  describe('onReset()', () => {
    it('should reset submitted flag', () => {
      component.submitted = true;
      component.onReset();
      expect(component.submitted).toBe(false);
    });

    it('should reset form to pristine state', () => {
      component.studentForm.setValue(validForm);
      component.onReset();
      expect(component.studentForm.pristine).toBe(true);
    });

    // CORRECTION : branche erreur non testée — onReset remet infoMessage à vide
    it('should reset infoMessage to empty', () => {
      component.infoMessage = { message: 'Création échouée', error: true };
      component.onReset();
      expect(component.infoMessage).toEqual({ message: '', error: false });
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
