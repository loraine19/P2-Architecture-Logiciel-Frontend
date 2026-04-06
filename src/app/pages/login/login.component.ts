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
 * Component - Login page with form validation and query-params message display
 * Redirects to returnUrl or /studentList after successful authentication
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['../../../styles.css']
})
export class LoginComponent implements OnInit {

  private userService = inject(UserService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private errorService = inject(ErrorService);

  loginForm!: FormGroup;
  submitted: boolean = false;
  infoMessage: InfoMessage = { message: '', error: false };
  passwordVisible: boolean = false;

  constructor() { }

  /** LIFECYCLE */
  /* NG ON INIT */
  ngOnInit(): void {
    this.initializeForm();
    this.checkQueryParams();
  }

  /** GETTER */
  /* FORM */
  get form() {
    return this.loginForm.controls;
  }

  /** PUBLIC */
  /* ON SUBMIT */
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

          setTimeout(() => {
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/studentList';
            this.router.navigateByUrl(returnUrl);
          }, 2000);
        },
        error: (err: HttpErrorResponse) => this.errorService.handleError(err, this.infoMessage)
      });
  }

  /* ON RESET */
  onReset(): void {
    this.submitted = false;
    this.infoMessage = { message: '', error: false };
    this.loginForm.reset();
  }

  /* TOGGLE PASSWORD VISIBILITY */
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  /** PRIVATE */
  /* INITIALIZE FORM */
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

  /* CHECK QUERY PARAMS */
  // read msg/error params passed by register or session-expired redirect
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