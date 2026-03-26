import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { MaterialModule } from '../../shared/material.module';
import { UserService } from '../../core/service/user.service';
import { InfoMessage } from '../../core/models/InfoMessage';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-test',
  imports: [CommonModule, MaterialModule],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css',
  standalone: true
})
export class TestComponent implements OnInit {
  private userService = inject(UserService);
  submitted: boolean = false;
  infoMessage: InfoMessage = { message: '', error: false };
  onTestApi(): void {
    this.userService.testApi()
      .subscribe({
        next: () => {
          this.infoMessage = { message: 'API Test successful', error: false };
        },
        error: (err: HttpErrorResponse) => this.infoMessage = { message: 'API Test failed', error: true }
      });
  }

  ngOnInit(): void {
    this.userService.testApi()
      .subscribe({
        next: () => {
          this.infoMessage = { message: 'API Test successful', error: false };
        },
        error: (err: HttpErrorResponse) => this.infoMessage = { message: 'API Test failed', error: true }
      });
  }
}

