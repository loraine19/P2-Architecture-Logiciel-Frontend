import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';

import { StudentService } from '../../core/service/student.service';
import { Student } from '../../core/models/Student';
import { InfoMessage } from '../../core/DTO/InfoMessage';
import { ErrorService } from '../../core/service/error.service';
import { MaterialModule } from '../../shared/material.module';

/**
 * Student creation component for adding new students to the system
 * Provides comprehensive form validation and error handling
 */
@Component({
  selector: 'app-student-create',
  standalone: true,
  imports: [ReactiveFormsModule, MaterialModule],
  templateUrl: './studentCreate.component.html',
  styleUrl: '../pages.css'
})
export class StudentCreateComponent implements OnInit {

  // Dependency Injections
  private studentService = inject(StudentService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private errorService = inject(ErrorService);
  private router = inject(Router);

  // Component State
  studentForm!: FormGroup;
  submitted: boolean = false;
  infoMessage: InfoMessage = { message: '', error: false };

  constructor() { }

  /** PUBLIC METHODS */

  /* INITIALIZATION */
  ngOnInit(): void {
    this.initializeForm();
  }

  /* FORM CONTROLS ACCESSOR */
  get form() {
    return this.studentForm.controls;
  }

  /* SUBMIT FORM */
  onSubmit(): void {
    this.submitted = true;

    if (this.studentForm.invalid) return;

    // Récupère directement les données du formulaire
    const newStudent: Student = this.studentForm.value;

    this.studentService.createStudent(newStudent)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.infoMessage = {
            message: `Student ${newStudent.firstName} ${newStudent.lastName} created successfully`,
            error: false
          };

          // Redirection après un court délai pour laisser lire le message
          setTimeout(() => {
            this.router.navigate(['/studentList']);
          }, 2000);
        },
        error: (err: HttpErrorResponse) => this.errorService.handleError(err, this.infoMessage)
      });
  }

  /* RESET FORM */
  onReset(): void {
    this.submitted = false;
    this.studentForm.reset();
    this.infoMessage = { message: '', error: false };
  }

  /* GO BACK */
  goBackToList(): void {
    this.router.navigate(['/studentList']);
  }

  /** PRIVATE METHODS */

  /* INITIALIZE FORM STRUCTURE */
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