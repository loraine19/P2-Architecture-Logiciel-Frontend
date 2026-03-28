import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Student, StudentDto } from '../models/Student';
import { StudentServiceInterface } from './servicesInterfaces/studentServicesInterface';

/**
 * Student service implementation for managing student data
 * Provides CRUD operations through REST API endpoints
 */
@Injectable({
  providedIn: 'root'
})
export class StudentService implements StudentServiceInterface {
  private readonly apiUrl = '/api/students';

  constructor(private httpClient: HttpClient) {
    console.log('StudentService initialized with API URL:', this.apiUrl);
  }

  /**
   * Retrieves all students from the server
   */
  getAllStudents(): Observable<Student[]> {
    console.log('Fetching all students from:', this.apiUrl);
    return this.httpClient.get<Student[]>(this.apiUrl).pipe(
      tap(students => console.log('Retrieved students count:', students.length))
    );
  }

  /**
   * Retrieves a specific student by their ID
   */
  getStudentById(id: number): Observable<Student> {
    console.log('Fetching student with ID:', id);
    return this.httpClient.get<Student>(`${this.apiUrl}/${id}`).pipe(
      tap(student => console.log('Retrieved student:', student.firstName, student.lastName))
    );
  }

  /**
   * Creates a new student record
   */
  createStudent(student: StudentDto): Observable<Student> {
    console.log('Creating new student:', student.firstName, student.lastName);
    return this.httpClient.post<Student>(this.apiUrl, student).pipe(
      tap(createdStudent => console.log('Created student with ID:', createdStudent.id))
    );
  }

  /**
   * Updates an existing student record
   */
  updateStudent(id: number, student: StudentDto): Observable<Student> {
    console.log('Updating student ID:', id, 'with data:', student.firstName, student.lastName);
    return this.httpClient.put<Student>(`${this.apiUrl}/${id}`, student).pipe(
      tap(updatedStudent => console.log('Updated student:', updatedStudent.firstName, updatedStudent.lastName))
    );
  }

  /**
   * Deletes a student record by ID
   */
  deleteStudent(id: number): Observable<void> {
    console.log('Deleting student with ID:', id);
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => console.log('Successfully deleted student ID:', id))
    );
  }
}
