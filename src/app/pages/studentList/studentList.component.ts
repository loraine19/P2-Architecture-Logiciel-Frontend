import { Component, inject, OnInit } from '@angular/core';

import { Router, RouterLink } from '@angular/router';
import { StudentService } from '../../core/service/student.service';
import { Student } from '../../core/models/Student';
import { MaterialModule } from '../../shared/material.module';
import { ErrorService } from '../../core/service/error.service';
import { InfoMessage, InfoMessageFactory } from '../../core/models/InfoMessage';

/**
 * Student list component displaying all students with CRUD operations
 * Provides responsive table/card layout and confirmation dialogs
 */
@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [MaterialModule, RouterLink],
  templateUrl: './studentList.component.html',
  styleUrl: '../pages.css'
})
export class StudentListComponent implements OnInit {
  private studentService = inject(StudentService);
  private errorService = inject(ErrorService);
  private router = inject(Router);

  students: Student[] = [];
  isLoading: boolean = true;
  infoMessage: InfoMessage = InfoMessageFactory.empty();
  pendingDeleteId: number | null = null;

  constructor() {
    console.log('StudentListComponent initialized');
  }

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.isLoading = true;
    this.studentService.getAllStudents().subscribe({
      next: (data) => {
        this.students = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorService.handleError(err, this.infoMessage);
        this.isLoading = false;
      }
    });
  }

  deleteStudent(id: number): void {
    this.pendingDeleteId = id;
    this.infoMessage = { message: '', error: false };
  }

  confirmDelete(): void {
    if (this.pendingDeleteId) {
      this.studentService.deleteStudent(this.pendingDeleteId).subscribe({
        next: () => {
          this.students = this.students.filter(s => s.id !== this.pendingDeleteId);
          this.infoMessage = { message: 'Student deleted successfully', error: false };
          this.pendingDeleteId = null;
        },
        error: (err) => {
          this.errorService.handleError(err, this.infoMessage);
          this.pendingDeleteId = null;
        }
      });
    }
  }

  cancelDelete(): void {
    this.pendingDeleteId = null;
    this.infoMessage = { message: '', error: false };
  }

  viewStudent(id: number): void {
    this.router.navigate(['/studentDetails', id]);
  }

  editStudent(id: number): void {
    this.router.navigate(['/studentEdit', id]);
  }
}