import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';

import { MaterialModule } from '../../shared/material.module';
import { UserService } from '../../core/service/user.service';
import { Login } from '../../core/DTO/Login';
import { InfoMessage } from '../../core/DTO/InfoMessage';
import { ErrorService } from '../../core/service/error.service';

/**
 * Login page component for user authentication
 * Provides secure login form with validation and error handling
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['../../../styles.css']
})
export class LoginComponent implements OnInit {

  // Dependency Injections
  private userService = inject(UserService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private errorService = inject(ErrorService);

  // Component State
  loginForm!: FormGroup;
  submitted: boolean = false;
  infoMessage: InfoMessage = { message: '', error: false };
  passwordVisible: boolean = false;

  constructor() { }

  /** PUBLIC METHODS */

  /* INITIALIZATION */
  ngOnInit(): void {
    this.initializeForm();
    this.checkQueryParams();
  }

  /* FORM CONTROLS ACCESSOR */
  get form() {
    return this.loginForm.controls;
  }

  /* SUBMIT LOGIN */
  onSubmit(): void {
    this.submitted = true;
    this.infoMessage = { message: '', error: false };

    if (this.loginForm.invalid) return;

    const credentials: Login = this.loginForm.value;

    this.userService.login(credentials)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.infoMessage = { message: `Hi, ${credentials.login}! You are now logged in!`, error: false };

          // Redirection après succès
          setTimeout(() => {
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/studentList';
            this.router.navigateByUrl(returnUrl);
          }, 2000);
        },
        error: (err: HttpErrorResponse) => this.errorService.handleError(err, this.infoMessage)
      });
  }

  /* RESET FORM */
  onReset(): void {
    this.submitted = false;
    this.infoMessage = { message: '', error: false };
    this.loginForm.reset();
  }

  /* TOGGLE PASSWORD VISIBILITY */
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  /** PRIVATE METHODS */

  /* INITIALIZE FORM STRUCTURE */
  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      login: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(128),
        Validators.pattern("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&.-_])[A-Za-z\\d@$!%*?&.-_]+$")
      ]],
      rememberMe: [true]
    });
  }

  /* CAPTURE QUERY PARAMETERS MESSAGES */
  private checkQueryParams(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const msg = params['msg'];
        const error = params['error'];

        if (msg) {
          this.infoMessage = {
            message: msg,
            error: error === 'true'
          };
        }
      });
  }
}