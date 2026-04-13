import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { StudentListComponent } from './studentList.component';
import { StudentService } from '../../core/service/student.service';
import { ErrorService } from '../../core/service/error.service';
import { MaterialModule } from '../../shared/material.module';
import { Student } from '../../core/models/Student';

const mockStudents: Student[] = [
    new Student(1, 'John', 'Doe', 'john@test.com', '0600000000', '1 rue Test', 'Paris', '75001'),
    new Student(2, 'Jane', 'Smith', 'jane@test.com', '0600000001', '2 rue Test', 'Lyon', '69001')
];

/**
 * Tests d'intégration pour StudentListComponent — utilise le vrai StudentService
 * On vérifie l'état du composant (students, isLoading) après les réponses HTTP réelles interceptées.
 */
describe('StudentListComponent — intégration (StudentService réel)', () => {
    let intComponent: StudentListComponent;
    let intFixture: ComponentFixture<StudentListComponent>;
    let httpMock: HttpTestingController;

    /** TEST SETUP */
    /* beforeEach */
    // StudentService réel — ErrorService resté mocké (logique déjà testée dans error.service.spec)
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StudentListComponent, MaterialModule],
            providers: [
                StudentService,
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([]),
                { provide: ErrorService, useValue: { handleError: jest.fn() } }
            ]
        }).compileComponents();

        intFixture = TestBed.createComponent(StudentListComponent);
        intComponent = intFixture.componentInstance;
        httpMock = TestBed.inject(HttpTestingController);
        // detectChanges() déclenche ngOnInit → getAllStudents() → requête HTTP en attente
        intFixture.detectChanges();
    });

    afterEach(() => httpMock.verify());

    /** INTEGRATION TESTS */
    /* CHARGEMENT */
    // le vrai StudentService fait le GET — on vérifie que le composant reçoit et affiche les données
    describe('Load Students', () => {
        it('should populate students array from real HTTP GET response', () => {
            httpMock.expectOne('/api/students').flush(mockStudents);
            expect(intComponent.students.length).toBe(2);
            expect(intComponent.students[0].firstName).toBe('John');
            expect(intComponent.isLoading).toBe(false);
        });
    });

    /* SUPPRESSION */
    // suppression réelle : DELETE HTTP + filtre local sur students[]
    describe('Delete Flow', () => {
        it('should update students array after real HTTP DELETE', () => {
            // chargement initial
            httpMock.expectOne('/api/students').flush(mockStudents);
            expect(intComponent.students.length).toBe(2);
            // déclenchement de la suppression en deux étapes
            intComponent.deleteStudent(1);
            intComponent.confirmDelete();
            // vrai StudentService envoie DELETE /api/students/1
            httpMock.expectOne('/api/students/1').flush(null, { status: 204, statusText: 'No Content' });
            // le composant retire l'étudiant sans refaire de GET
            expect(intComponent.students.find(s => s.id === 1)).toBeUndefined();
            expect(intComponent.students.length).toBe(1);
        });
    });
});
