import { Observable } from "rxjs";
import { Student, StudentDto } from "../../models/Student";

/**
 * Student service interface for CRUD operations
 * Defines contract for student data management
 */
export interface StudentServiceInterface {
  /**
   * Retrieves all students from the system
   */
  getAllStudents(): Observable<Student[]>;

  /**
   * Retrieves a specific student by ID
   */
  getStudentById(id: number): Observable<Student>;

  /**
   * Creates a new student record
   */
  createStudent(student: StudentDto): Observable<Student>;

  /**
   * Updates an existing student record
   */
  updateStudent(id: number, student: StudentDto): Observable<Student>;

  /**
   * Deletes a student record by ID
   */
  deleteStudent(id: number): Observable<void>;
}