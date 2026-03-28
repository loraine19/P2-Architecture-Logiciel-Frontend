import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MaterialModule } from '../../shared/material.module';
import { UserService } from '../../core/service/user.service';
import { Login } from '../../core/models/Login';
import { InfoMessage } from '../../core/models/InfoMessage';
import { ErrorService } from '../../core/service/error.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: '../pages.css'
})
export class LoginComponent implements OnInit {
  private userService = inject(UserService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private errorService = inject(ErrorService);

  loginForm: FormGroup = new FormGroup({});
  submitted: boolean = false;
  infoMessage: InfoMessage = { message: '', error: false };
  passwordVisible: boolean = false;

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      login: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(100),
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(128),
        Validators.pattern("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&.-_])[A-Za-z\\d@$!%*?&.-_]+$")
      ]]
    });
    // Check for query params to display messages
    this.route.queryParams.subscribe(params => {
      const msg = params['msg'];
      const error = params['error'];
      if (msg) {
        this.infoMessage.message = msg;
        this.infoMessage.error = error === 'true';
      }
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
          setTimeout(() => {
            // Get return URL from query params or default to studentList
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/studentList';
            console.log('Login successful, redirecting to:', returnUrl);

            // Parse the URL to remove any nested returnUrl parameters to prevent loops
            const urlObj = new URL(returnUrl, window.location.origin);
            urlObj.searchParams.delete('returnUrl');
            const cleanUrl = urlObj.pathname + (urlObj.search ? urlObj.search : '');

            this.router.navigateByUrl(cleanUrl);
          }, 2000);
        },
        error: (err: HttpErrorResponse) => this.errorService.handleError(err, this.infoMessage)
      });
  }



  onReset(): void {
    this.submitted = false;
    this.infoMessage = { message: '', error: false };
    this.loginForm.reset();
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }
}
