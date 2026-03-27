import { Observable } from "rxjs";
import { Student, StudentDto } from "../../models/Student";

export interface StudentServiceInterface {
  getAllStudents(): Observable<Student[]>;
  getStudentById(id: number): Observable<Student>;
  createStudent(student: StudentDto): Observable<Student>;
  updateStudent(id: number, student: StudentDto): Observable<Student>;
  deleteStudent(id: number): Observable<void>;
}