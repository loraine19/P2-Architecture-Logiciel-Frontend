import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';

import { Student } from '../../core/models/Student';
import { StudentService } from '../../core/service/student.service';
import { InfoMessage } from '../../core/DTO/InfoMessage';
import { ErrorService } from '../../core/service/error.service';
import { MaterialModule } from '../../shared/material.module';

/**
 * Student details component for viewing and editing student information
 * Supports both view and edit modes with comprehensive validation
 */
@Component({
  selector: 'app-student-details',
  standalone: true,
  imports: [ReactiveFormsModule, MaterialModule],
  templateUrl: './studentDetails.component.html',
  styleUrl: '../pages.css'
})
export class StudentDetailsComponent implements OnInit {

  // Dependency Injections
  private studentService = inject(StudentService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private errorService = inject(ErrorService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Component State
  studentForm!: FormGroup;
  submitted: boolean = false;
  infoMessage: InfoMessage = { message: '', error: false };
  isLoading: boolean = true;
  isEditMode: boolean = false;
  student: Student | null = null;
  studentId: number | null = null;

  constructor() { }

  /** PUBLIC METHODS */

  /* INITIALIZATION */
  ngOnInit(): void {
    this.initializeForm();
    this.loadStudentFromRoute();
  }

  /* TOGGLE EDIT MODE */
  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    this.setFormReadonlyState(!this.isEditMode);
    this.infoMessage = { message: '', error: false };
  }

  /* SUBMIT FORM */
  onSubmit(): void {
    if (!this.isEditMode || !this.studentId) return;

    this.submitted = true;
    if (this.studentForm.invalid) return;

    // Fusionne les valeurs du formulaire avec l'ID de l'étudiant
    const updatedStudent: Student = { ...this.studentForm.value, id: this.studentId };

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

  /* CANCEL ACTION */
  onCancel(): void {
    if (this.isEditMode) {
      if (this.student) this.populateForm(this.student);
      this.isEditMode = false;
      this.setFormReadonlyState(true);
      this.submitted = false;
      this.infoMessage = { message: '', error: false };
    } else {
      this.router.navigate(['/studentList']);
    }
  }

  /* GO BACK */
  goBackToList(): void {
    this.router.navigate(['/studentList']);
  }

  /* FORM CONTROLS ACCESSOR */
  get form() {
    return this.studentForm.controls;
  }

  /** PRIVATE METHODS */

  /* INITIALIZE FORM STRUCTURE */
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

  /* GET ID FROM ROUTE */
  private loadStudentFromRoute(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.studentId = parseInt(id, 10);
      this.loadStudent();
    } else {
      this.isLoading = false;
    }
  }

  /* FETCH STUDENT DATA */
  private loadStudent(): void {
    if (!this.studentId) return;

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

  /* FILL FORM WITH DATA */
  private populateForm(student: Student): void {
    this.studentForm.patchValue(student);
    this.setFormReadonlyState(true);
  }

  /* MANAGE FORM STATE */
  private setFormReadonlyState(readonly: boolean): void {
    readonly ? this.studentForm.disable() : this.studentForm.enable();
  }
}