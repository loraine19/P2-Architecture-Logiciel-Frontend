import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MaterialModule } from '../../shared/material.module';
import { UserService } from '../../core/service/user.service';
import { Login } from '../../core/models/Login';
import { InfoMessage } from '../../core/models/InfoMessage';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private userService = inject(UserService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  loginForm: FormGroup = new FormGroup({});
  submitted: boolean = false;
  infoMessage: InfoMessage = { message: '', error: false };

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      login: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  get form() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.infoMessage = { message: '', error: false };

    if (this.loginForm.invalid) {
      return;
    }

    const credentials: Login = this.loginForm.value;

    this.userService.login(credentials)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.infoMessage = { message: 'Hi, ' + credentials.login + '! you are now logged in !', error: false };
          this.router.navigate(['/']);
        },
        error: (err: HttpErrorResponse) => this.handleError(err)
      });
  }

  // Handle errors from the login attempt and set an appropriate message for the user
  private handleError(err: HttpErrorResponse): void {
    let message = 'An unexpected error occurred. Please try again.';

    if (err.error?.message) {
      message = err.error.message;
    } else {
      switch (err.status) {
        case 0:
          message = 'Unable to connect to the server. Please check your network.';
          break;
        case 401:
          message = 'Invalid credentials. Please check your login and password.';
          break;
        case 403:
          message = 'Access denied.';
          break;
        case 404:
          message = 'Service not found.';
          break;
        case 500:
          message = 'Internal server error.';
          break;
      }
    }

    this.infoMessage = { message, error: true };
  }

  onReset(): void {
    this.submitted = false;
    this.infoMessage = { message: '', error: false };
    this.loginForm.reset();
  }
}