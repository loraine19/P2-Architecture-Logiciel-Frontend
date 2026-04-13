import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { StudentDetailsComponent } from './studentDetails.component';
import { StudentService } from '../../core/service/student.service';
import { ErrorService } from '../../core/service/error.service';
import { MaterialModule } from '../../shared/material.module';
import { Student } from '../../core/models/Student';

const mockStudent = new Student(1, 'John', 'Doe', 'john@test.com', '0600000000', '1 rue Test', 'Paris', '75001');

/**
 * Tests d'intégration pour StudentDetailsComponent — utilise le vrai StudentService
 * ngOnInit charge le vrai étudiant via HTTP — on vérifie le formulaire peuplé et le PUT après modification.
 */
describe('StudentDetailsComponent — intégration (StudentService réel)', () => {
    let intComponent: StudentDetailsComponent;
    let intFixture: ComponentFixture<StudentDetailsComponent>;
    let httpMock: HttpTestingController;

    /** TEST SETUP */
    /* beforeEach */
    // StudentService réel + ActivatedRoute fixé sur id=1 — ErrorService resté mocké
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StudentDetailsComponent, ReactiveFormsModule, MaterialModule],
            providers: [
                StudentService,
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([]),
                { provide: ErrorService, useValue: { handleError: jest.fn() } },
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }
            ]
        }).compileComponents();

        intFixture = TestBed.createComponent(StudentDetailsComponent);
        intComponent = intFixture.componentInstance;
        httpMock = TestBed.inject(HttpTestingController);
        // detectChanges() déclenche ngOnInit → loadStudent() → GET /api/students/1
        intFixture.detectChanges();
    });

    afterEach(() => httpMock.verify());

    /** INTEGRATION TESTS */
    /* CHARGEMENT */
    // le vrai StudentService fait le GET — on vérifie que le formulaire est peuplé avec les bonnes données
    describe('Load Student', () => {
        it('should populate form fields from real HTTP GET response', () => {
            // vrai StudentService intercepté — on retourne mockStudent
            httpMock.expectOne('/api/students/1').flush(mockStudent);
            expect(intComponent.studentForm.get('firstName')?.value).toBe('John');
            expect(intComponent.studentForm.get('email')?.value).toBe('john@test.com');
            expect(intComponent.isLoading).toBe(false);
            // formulaire verrouillé en lecture seule après chargement
            expect(intComponent.studentForm.disabled).toBe(true);
        });
    });

    /* MODIFICATION */
    // passage en mode édition, modification, soumission — verify le PUT et l'état post-mise à jour
    describe('Update Flow', () => {
        it('should PUT updated data and refresh component.student', () => {
            httpMock.expectOne('/api/students/1').flush(mockStudent);
            // basculer en mode édition déverrouille le formulaire
            intComponent.toggleEditMode();
            expect(intComponent.studentForm.disabled).toBe(false);
            // modifier un champ puis soumettre
            intComponent.studentForm.get('firstName')?.setValue('Jonathan');
            intComponent.onSubmit();
            // vrai StudentService envoie PUT /api/students/1 avec les données modifiées
            const req = httpMock.expectOne('/api/students/1');
            expect(req.request.method).toBe('PUT');
            expect(req.request.body.firstName).toBe('Jonathan');
            req.flush({ ...mockStudent, firstName: 'Jonathan' });
            // le composant met à jour student et quitte le mode édition
            expect(intComponent.student?.firstName).toBe('Jonathan');
            expect(intComponent.isEditMode).toBe(false);
        });
    });
});
