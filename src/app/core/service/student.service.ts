import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student, StudentDto } from '../models/Student';
import { StudentServiceInterface } from './servicesInterfaces/studentServicesInterface';

/**
 * Service - Manages student CRUD operations via HTTP
 * All methods return Observables so the component can subscribe and react
 */
@Injectable({
  providedIn: 'root'
})
export class StudentService implements StudentServiceInterface {
  private readonly apiUrl = '/api/students';

  constructor(private httpClient: HttpClient) { }

  /** PUBLIC */
  /* GET ALL STUDENTS */
  getAllStudents(): Observable<Student[]> {
    return this.httpClient.get<Student[]>(this.apiUrl);
  }

  /* GET STUDENT BY ID */
  getStudentById(id: number): Observable<Student> {
    return this.httpClient.get<Student>(`${this.apiUrl}/${id}`);
  }

  /* CREATE STUDENT */
  createStudent(student: StudentDto): Observable<Student> {
    return this.httpClient.post<Student>(this.apiUrl, student);
  }

  /* UPDATE STUDENT */
  updateStudent(id: number, student: StudentDto): Observable<Student> {
    return this.httpClient.put<Student>(`${this.apiUrl}/${id}`, student);
  }

  /* DELETE STUDENT */
  deleteStudent(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }
}
