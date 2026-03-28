import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserService } from '../../core/service/user.service';
import { UserDTO } from '../../core/models/Register';
import { InfoMessage, InfoMessageFactory } from '../../core/models/InfoMessage';
import { ErrorService } from '../../core/service/error.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Registration page component for new user account creation
 * Provides secure registration form with validation and password visibility toggle
 */
@Component({
  selector: 'app-register',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  standalone: true,
  styleUrl: '../pages.css'
})
export class RegisterComponent implements OnInit {
  private userService = inject(UserService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private errorService = inject(ErrorService);
  private router = inject(Router);

  registerForm: FormGroup = new FormGroup({});
  submitted: boolean = false;
  infoMessage: InfoMessage = InfoMessageFactory.empty();
  passwordVisible: boolean = false;

  constructor() {
    console.log('RegisterComponent initialized');
  }

  ngOnInit() {
    this.registerForm = this.formBuilder.group(
      {
        firstName: ['', [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern("^[a-zA-ZÀ-ÿ\\s'-]+$")
        ]],
        lastName: ['', [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern("^[a-zA-ZÀ-ÿ\\s'-]+$")
        ]],
        login: ['', [
          Validators.required,
          Validators.email,
          Validators.maxLength(100)
        ]],
        password: ['', [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(128),
          Validators.pattern("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&.-_])[A-Za-z\\d@@$!%*?&.-_]+$")
        ]]
      },
    );
  }

  get form() {
    return this.registerForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.registerForm.invalid) {
      return;
    }
    const registerUser: UserDTO = {
      firstName: this.registerForm.get('firstName')?.value,
      lastName: this.registerForm.get('lastName')?.value,
      login: this.registerForm.get('login')?.value,
      password: this.registerForm.get('password')?.value
    };
    this.userService.register(registerUser)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.infoMessage = { message: 'Hi, ' + registerUser.login + '! you are now registered , you can now log in! ', error: false };
          setTimeout(() => {
            this.router.navigate(['/login?msg=Registration successful! Please log in.&error=false']);
          }, 2000);
        },
        error: (err: HttpErrorResponse) => this.errorService.handleError(err, this.infoMessage)
      });
  }
  onReset(): void {
    this.submitted = false;
    this.registerForm.reset();
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }
}
