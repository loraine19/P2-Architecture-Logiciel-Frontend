import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';

import { StudentService } from '../../core/service/student.service';
import { Student } from '../../core/models/Student';
import { InfoMessage } from '../../core/constants/InfoMessage';
import { ErrorService } from '../../core/service/error.service';
import { MaterialModule } from '../../shared/material.module';
import { AppNotificationMessage } from '../../core/constants/appNotification';

/**
 * Component - Form for creating a new student record
 * Redirects to /studentList after a successful creation
 */
@Component({
  selector: 'app-student-create',
  standalone: true,
  imports: [ReactiveFormsModule, MaterialModule],
  templateUrl: './studentCreate.component.html',
  styleUrls: ['../../../styles.css']
})
export class StudentCreateComponent implements OnInit {

  private studentService = inject(StudentService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private errorService = inject(ErrorService);
  private router = inject(Router);

  studentForm!: FormGroup;
  submitted: boolean = false;
  infoMessage: InfoMessage = { message: '', error: false };

  constructor() { }

  /** LIFECYCLE */
  /* NG ON INIT */
  ngOnInit(): void {
    this.initializeForm();
  }

  /** GETTER */
  /* FORM */
  get form() {
    return this.studentForm.controls;
  }

  /** PUBLIC */
  /* ON SUBMIT */
  onSubmit(): void {
    this.submitted = true;

    if (this.studentForm.invalid) return;

    const newStudent: Student = this.studentForm.value;

    this.studentService.createStudent(newStudent)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.infoMessage = {
            message: AppNotificationMessage.STUDENT_CREATED(newStudent.firstName, newStudent.lastName),
            error: false
          };

          setTimeout(() => {
            this.router.navigate(['/studentList']);
          }, 2000);
        },
        error: (err: HttpErrorResponse) => this.errorService.handleError(err, this.infoMessage)
      });
  }

  /* ON RESET */
  onReset(): void {
    this.submitted = false;
    this.studentForm.reset();
    this.infoMessage = { message: '', error: false };
  }

  /* GO BACK TO LIST */
  goBackToList(): void {
    this.router.navigate(['/studentList']);
  }

  /** PRIVATE */
  /* INITIALIZE FORM */
  private initializeForm(): void {
    this.studentForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      phoneNumber: ['', [Validators.pattern(/^[+]?[0-9\s\-().]{10,20}$/)]],
      address: ['', [Validators.required, Validators.maxLength(200)]],
      city: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      zipCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]]
    });
  }
}