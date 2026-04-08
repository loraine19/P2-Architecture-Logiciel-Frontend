import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';

import { Student } from '../../core/models/Student';
import { StudentService } from '../../core/service/student.service';
import { InfoMessage } from '../../core/constants/InfoMessage';
import { ErrorService } from '../../core/service/error.service';
import { MaterialModule } from '../../shared/material.module';
import { AppNotificationMessage } from '../../core/constants/appNotification';

/**
 * Component - View and edit a single student record
 * Starts in read-only mode; edit mode is toggled by the user or the URL path
 */
@Component({
  selector: 'app-student-details',
  standalone: true,
  imports: [ReactiveFormsModule, MaterialModule],
  templateUrl: './studentDetails.component.html',
  styleUrls: ['../../../styles.css']
})
export class StudentDetailsComponent implements OnInit {

  private studentService = inject(StudentService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private errorService = inject(ErrorService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  studentForm!: FormGroup;
  submitted: boolean = false;
  infoMessage: InfoMessage = { message: '', error: false };
  isLoading: boolean = true;
  isEditMode: boolean = false;
  student: Student | null = null;
  studentId: number | null = null;

  constructor() { }

  /** LIFECYCLE */
  /* NG ON INIT */
  ngOnInit(): void {
    this.initializeForm();
    this.loadStudentFromRoute();
    this.getEditModeFromRoute();
  }

  /** PUBLIC */
  /* TOGGLE EDIT MODE */
  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    this.setFormReadonlyState(!this.isEditMode);
    this.infoMessage = { message: '', error: false };
  }

  /* ON SUBMIT */
  onSubmit(): void {
    if (!this.isEditMode || !this.studentId) return;

    this.submitted = true;
    if (this.studentForm.invalid) return;

    const updatedStudent: Student = { ...this.studentForm.value, id: this.studentId };

    this.studentService.updateStudent(this.studentId, updatedStudent)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (student) => {
          this.student = student;
          this.infoMessage = {
            message: AppNotificationMessage.STUDENT_UPDATED(student.firstName, student.lastName),
            error: false
          };
          this.isEditMode = false;
          this.setFormReadonlyState(true);
          this.submitted = false;
        },
        error: (err: HttpErrorResponse) => this.errorService.handleError(err, this.infoMessage)
      });
  }

  /* ON CANCEL */
  // in edit mode: discard changes | otherwise: go back to the list
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

  /* GO BACK TO LIST */
  goBackToList(): void {
    this.router.navigate(['/studentList']);
  }

  /** GETTER */
  /* FORM */
  get form() {
    return this.studentForm.controls;
  }

  /** PRIVATE */
  /* INITIALIZE FORM */
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

  /* LOAD STUDENT FROM ROUTE */
  // get the student ID from the URL param
  private loadStudentFromRoute(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.studentId = parseInt(id, 10);
      this.loadStudent();
    } else {
      this.isLoading = false;
    }
  }

  /* GET EDIT MODE FROM ROUTE */
  // check URL to determine if we're on the edit path
  private getEditModeFromRoute(): void {
    const url = this.router.url;
    this.isEditMode = url.includes('/studentEdit');
  }

  /* LOAD STUDENT */
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

  /* POPULATE FORM */
  // fill form fields with the loaded student data and lock the form
  private populateForm(student: Student): void {
    this.studentForm.patchValue(student);
    this.setFormReadonlyState(true);
  }

  /* SET FORM READONLY STATE */
  // disable/enable all fields to switch between view and edit mode
  private setFormReadonlyState(readonly: boolean): void {
    readonly ? this.studentForm.disable() : this.studentForm.enable();
  }
}