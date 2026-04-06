import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { StudentDetailsComponent } from './studentDetails.component';
import { StudentService } from '../../core/service/student.service';
import { ErrorService } from '../../core/service/error.service';
import { MaterialModule } from '../../shared/material.module';
import { Student } from '../../core/models/Student';

const mockStudent = new Student(1, 'John', 'Doe', 'john@test.com', '0600000000', '1 rue Test', 'Paris', '75001');

describe('StudentDetailsComponent', () => {
  let component: StudentDetailsComponent;
  let fixture: ComponentFixture<StudentDetailsComponent>;
  let studentService: jest.Mocked<StudentService>;
  let router: Router;

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
    studentService.getStudentById.mockReturnValue(of(mockStudent));

    fixture = TestBed.createComponent(StudentDetailsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  };

  beforeEach(async () => setupWithId('1'));

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

    it('should not load student when no ID in route', async () => {
      TestBed.resetTestingModule();
      await setupWithId(null);
      expect(studentService.getStudentById).not.toHaveBeenCalled();
      expect(component.isLoading).toBe(false);
    });
  });

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
      expect(component.infoMessage.message).toContain('updated');
    });

    it('should exit edit mode after successful update', () => {
      component.toggleEditMode();
      studentService.updateStudent.mockReturnValue(of(mockStudent));
      component.onSubmit();
      expect(component.isEditMode).toBe(false);
    });
  });

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

  describe('goBackToList()', () => {
    it('should navigate to /studentList', () => {
      const navigateSpy = jest.spyOn(router, 'navigate');
      component.goBackToList();
      expect(navigateSpy).toHaveBeenCalledWith(['/studentList']);
    });
  });
});

