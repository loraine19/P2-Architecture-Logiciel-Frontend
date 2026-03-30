import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';

import { UserService } from '../../core/service/user.service';
import { UserDTO } from '../../core/models/User';
import { ErrorService } from '../../core/service/error.service';
import { MaterialModule } from '../../shared/material.module';
import { InfoMessage } from '../../core/DTO/InfoMessage';

/**
 * Registration page component for new user account creation
 * Provides secure registration form with validation and password visibility toggle
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: '../pages.css'
})
export class RegisterComponent implements OnInit {

  // Dependency Injections
  private userService = inject(UserService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private errorService = inject(ErrorService);
  private router = inject(Router);

  // Component State
  registerForm!: FormGroup;
  submitted: boolean = false;
  infoMessage: InfoMessage = { message: '', error: false };
  passwordVisible: boolean = false;

  constructor() { }

  /** PUBLIC METHODS */

  /* INITIALIZATION */
  ngOnInit(): void {
    this.initializeForm();
  }

  /* FORM CONTROLS ACCESSOR */
  get form() {
    return this.registerForm.controls;
  }

  /* TOGGLE PASSWORD VISIBILITY */
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  /* SUBMIT REGISTRATION */
  onSubmit(): void {
    this.submitted = true;

    if (this.registerForm.invalid) return;

    // Récupère l'objet utilisateur directement depuis le formulaire
    const registerUser: UserDTO = this.registerForm.value;

    this.userService.register(registerUser)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.infoMessage = {
            message: `Hi, ${registerUser.login}! You are now registered, you can now log in!`,
            error: false
          };

          // Redirection avec les queryParams correctement formatés
          setTimeout(() => {
            this.router.navigate(['/login'], {
              queryParams: {
                msg: 'Registration successful! Please log in.',
                error: 'false'
              }
            });
          }, 2000);
        },
        error: (err: HttpErrorResponse) => this.errorService.handleError(err, this.infoMessage)
      });
  }

  /* RESET FORM */
  onReset(): void {
    this.submitted = false;
    this.registerForm.reset();
  }

  /** PRIVATE METHODS */

  /* INITIALIZE FORM STRUCTURE */
  private initializeForm(): void {
    this.registerForm = this.formBuilder.group({
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
        Validators.pattern("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&.-_])[A-Za-z\\d@$!%*?&.-_]+$")
      ]]
    });
  }
}