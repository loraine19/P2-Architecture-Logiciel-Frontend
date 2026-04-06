import { Observable } from "rxjs";
import { Student, StudentDto } from "../../models/Student";

/**
 * Interface - Contract for student CRUD operations
 * Defines all methods any student service implementation must expose
 */
/** INTERFACE */
/* STUDENT SERVICE INTERFACE */
export interface StudentServiceInterface {
  getAllStudents(): Observable<Student[]>;
  getStudentById(id: number): Observable<Student>;
  createStudent(student: StudentDto): Observable<Student>;
  updateStudent(id: number, student: StudentDto): Observable<Student>;
  deleteStudent(id: number): Observable<void>;
}