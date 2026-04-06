import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { StudentService } from '../../core/service/student.service';
import { Student } from '../../core/models/Student';
import { MaterialModule } from '../../shared/material.module';
import { ErrorService } from '../../core/service/error.service';
import { InfoMessage } from '../../core/DTO/InfoMessage';

/**
 * Component - Displays all students with delete, view and edit shortcuts
 * Uses a Subject to unsubscribe from Observables on destroy
 */
@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [MaterialModule, RouterLink],
  templateUrl: './studentList.component.html',
  styleUrls: ['../../../styles.css']
})
export class StudentListComponent implements OnInit, OnDestroy {

  private studentService = inject(StudentService);
  private errorService = inject(ErrorService);
  private router = inject(Router);

  students: Student[] = [];
  isLoading: boolean = true;
  infoMessage: InfoMessage = { message: '', error: false };
  pendingDeleteId: number | null = null;

  private destroy$ = new Subject<void>();

  constructor() { }

  /** LIFECYCLE */
  /* NG ON INIT */
  ngOnInit(): void {
    this.loadStudents();
  }

  /* NG ON DESTROY */
  // complete the Subject so all takeUntil subscriptions are unsubscribed
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** PUBLIC */
  /* LOAD STUDENTS */
  loadStudents(): void {
    this.isLoading = true;
    this.studentService.getAllStudents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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

  /* DELETE STUDENT */
  // store the pending ID so the template can show a confirmation dialog
  deleteStudent(id: number): void {
    this.pendingDeleteId = id;
    this.infoMessage = { message: '', error: false };
  }

  /* CONFIRM DELETE */
  confirmDelete(): void {
    if (!this.pendingDeleteId) return;

    this.studentService.deleteStudent(this.pendingDeleteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // update local list without refetching from server
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

  /* CANCEL DELETE */
  cancelDelete(): void {
    this.pendingDeleteId = null;
    this.infoMessage = { message: '', error: false };
  }

  /* VIEW STUDENT */
  viewStudent(id: number): void {
    this.router.navigate(['/studentDetails', id]);
  }

  /* EDIT STUDENT */
  editStudent(id: number): void {
    this.router.navigate(['/studentEdit', id]);
  }

}