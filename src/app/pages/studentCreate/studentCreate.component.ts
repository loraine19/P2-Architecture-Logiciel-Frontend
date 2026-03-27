import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Student, StudentDto } from '../../core/models/Student';
import { StudentService } from '../../core/service/student.service';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InfoMessage } from '../../core/models/InfoMessage';
import { ErrorService } from '../../core/service/error.service';
import { MaterialModule } from '../../shared/material.module';

@Component({
  selector: 'app-studentCreate',
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './studentCreate.component.html',
  styleUrl: '../pages.css'
})
export class StudentCreateComponent implements OnInit {
  private studentService = inject(StudentService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private errorService = inject(ErrorService);
  private router = inject(Router);

  studentForm: FormGroup = new FormGroup({});
  submitted: boolean = false;
  infoMessage: InfoMessage = { message: '', error: false };

  ngOnInit(): void {
    this.studentForm = this.formBuilder.group({
      firstName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(100)
      ]],
      phoneNumber: ['', [Validators.pattern(/^[+]?[0-9\s\-().]{10,20}$/)]],
      address: ['', [
        Validators.required,
        Validators.maxLength(200)
      ]],
      city: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      zipCode: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{5}$/)
      ]]
    });
  }

  get form() {
    return this.studentForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.studentForm.invalid) {
      return;
    }
    const createdStudent: StudentDto = {
      firstName: this.studentForm.get('firstName')?.value,
      lastName: this.studentForm.get('lastName')?.value,
      email: this.studentForm.get('email')?.value,
      phoneNumber: this.studentForm.get('phoneNumber')?.value,
      address: this.studentForm.get('address')?.value,
      city: this.studentForm.get('city')?.value,
      zipCode: this.studentForm.get('zipCode')?.value
    };
    this.studentService.createStudent(createdStudent)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.infoMessage = { message: 'You\'ve successfully created a student ' + createdStudent.firstName + ' ' + createdStudent.lastName, error: false };
          setTimeout(() => {
            this.router.navigate(['/studentList']);
          }, 2000);
        },
        error: (err: HttpErrorResponse) => this.errorService.handleError(err, this.infoMessage)
      });
  }
  onReset(): void {
    this.submitted = false;
    this.studentForm.reset();
    this.infoMessage = { message: '', error: false };
  }

  goBackToList(): void {
    this.router.navigate(['/studentList']);
  }
}
