import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student, StudentDto } from '../models/Student';
import { StudentServiceInterface } from './servicesInterfaces/studentServicesInterface';

@Injectable({
  providedIn: 'root'
})
export class StudentService implements StudentServiceInterface {
  private readonly apiUrl = '/api/students';

  constructor(private httpClient: HttpClient) { }

  getAllStudents(): Observable<Student[]> {
    return this.httpClient.get<Student[]>(this.apiUrl);
  }

  getStudentById(id: number): Observable<Student> {
    return this.httpClient.get<Student>(`${this.apiUrl}/${id}`);
  }

  createStudent(student: StudentDto): Observable<Student> {
    return this.httpClient.post<Student>(this.apiUrl, student);
  }

  updateStudent(id: number, student: Student): Observable<Student> {
    return this.httpClient.put<Student>(`${this.apiUrl}/${id}`, student);
  }

  deleteStudent(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }
}
