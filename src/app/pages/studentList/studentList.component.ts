import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { StudentService } from '../../core/service/student.service';
import { Student } from '../../core/models/Student';
import { MaterialModule } from '../../shared/material.module';
import { ErrorService } from '../../core/service/error.service';
import { InfoMessage } from '../../core/models/InfoMessage';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterLink],
  templateUrl: './studentList.component.html',
  styleUrl: '../pages.css'
})
export class StudentListComponent implements OnInit {
  private studentService = inject(StudentService);
  private errorService = inject(ErrorService);
  private router = inject(Router);

  students: Student[] = [];
  infoMessage: InfoMessage = { message: '', error: false };
  isLoading: boolean = true;

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
    if (confirm('Are you sure you want to delete this student?')) {
      this.studentService.deleteStudent(id).subscribe({
        next: () => {
          this.students = this.students.filter(s => s.id !== id);
          this.infoMessage = { message: 'Student deleted successfully', error: false };
        },
        error: (err) => this.errorService.handleError(err, this.infoMessage)
      });
    }
  }

  viewStudent(id: number): void {
    this.router.navigate(['/studentDetails', id]);
  }

  editStudent(id: number): void {
    this.router.navigate(['/studentEdit', id]);
  }
}