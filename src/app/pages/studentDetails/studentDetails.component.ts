import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';
import { Student, StudentDto } from '../../core/models/Student';
import { StudentService } from '../../core/service/student.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InfoMessage, InfoMessageFactory } from '../../core/models/InfoMessage';
import { ErrorService } from '../../core/service/error.service';
import { MaterialModule } from '../../shared/material.module';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Student details component for viewing and editing student information
 * Supports both view and edit modes with comprehensive validation
 */
@Component({
  selector: 'app-student-details',
  imports: [ReactiveFormsModule, MaterialModule],
  templateUrl: './studentDetails.component.html',
  styleUrl: '../pages.css'
})
export class StudentDetailsComponent implements OnInit {
  private studentService = inject(StudentService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private errorService = inject(ErrorService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  studentForm: FormGroup = new FormGroup({});
  submitted: boolean = false;
  infoMessage: InfoMessage = InfoMessageFactory.empty();
  isLoading: boolean = true;
  isEditMode: boolean = false;
  student: Student | null = null;


  studentId: number | null = null;

  constructor() {
    console.log('StudentDetailsComponent initialized');
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadStudentFromRoute();
  }

  private initializeForm(): void {
    this.studentForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-\(\)]+$/)]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      zipCode: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]]
    });
  }

  private loadStudentFromRoute(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.studentId = parseInt(id, 10);
      this.loadStudent();
    } else {
      this.isLoading = false;
    }
  }

  private loadStudent(): void {
    if (this.studentId) {
      this.studentService.getStudentById(this.studentId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (student) => {
            this.student = student;
            this.populateForm(student);
            this.isLoading = false;
          },
          error: (err: HttpErrorResponse) => {
            this.errorService.handleError(err, this.infoMessage);
            this.isLoading = false;
          }
        });
    }
  }

  private populateForm(student: Student): void {
    this.studentForm.patchValue({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phoneNumber: student.phoneNumber,
      address: student.address,
      city: student.city,
      zipCode: student.zipCode
    });

    // Set form to readonly mode initially
    this.setFormReadonlyState(true);
  }

  private setFormReadonlyState(readonly: boolean): void {
    if (readonly) {
      this.studentForm.disable();
    } else {
      this.studentForm.enable();
    }
  }

  get form() {
    return this.studentForm.controls;
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    this.setFormReadonlyState(!this.isEditMode);
    this.infoMessage = { message: '', error: false }; // Clear messages
  }

  onSubmit(): void {
    if (!this.isEditMode || !this.studentId) {
      return;
    }

    this.submitted = true;
    if (this.studentForm.invalid) {
      return;
    }

    const updatedStudent: Student = {
      id: this.studentId,
      firstName: this.studentForm.get('firstName')?.value,
      lastName: this.studentForm.get('lastName')?.value,
      email: this.studentForm.get('email')?.value,
      phoneNumber: this.studentForm.get('phoneNumber')?.value,
      address: this.studentForm.get('address')?.value,
      city: this.studentForm.get('city')?.value,
      zipCode: this.studentForm.get('zipCode')?.value
    };

    this.studentService.updateStudent(this.studentId, updatedStudent)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (student) => {
          this.student = student;
          this.infoMessage = {
            message: `Student ${student.firstName} ${student.lastName} has been updated successfully`,
            error: false
          };
          this.isEditMode = false;
          this.setFormReadonlyState(true);
          this.submitted = false;
        },
        error: (err: HttpErrorResponse) => this.errorService.handleError(err, this.infoMessage)
      });
  }

  onCancel(): void {
    if (this.isEditMode) {
      // Reset form to original values
      if (this.student) {
        this.populateForm(this.student);
      }
      this.isEditMode = false;
      this.setFormReadonlyState(true);
      this.submitted = false;
      this.infoMessage = { message: '', error: false };
    } else {
      // Navigate back to student list
      this.router.navigate(['/studentList']);
    }
  }

  goBackToList(): void {
    this.router.navigate(['/studentList']);
  }
}
