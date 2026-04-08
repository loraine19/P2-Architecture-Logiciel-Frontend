/// <reference types="cypress" />

/**
 * E2E — StudentListComponent
 *
 * Covers:
 *  - Auth guard: unauthenticated access → redirect to /home
 *  - Authenticated access → student list displayed
 *  - Empty state
 *  - Navigation to student details
 *  - Navigation to student edit
 *  - Navigation to student creation
 *  - Delete flow with confirmation dialog
 *  - Delete flow cancelled
 *  - API error during load
 */
describe('Student List Page', () => {
    // ─── Auth Guard ───────────────────────────────────────────────────────────

    describe('Auth Guard', () => {
        it('should redirect unauthenticated user to /home', () => {
            cy.visit('/studentList');
            cy.url().should('include', '/home');
        });
    });

    // ─── Authenticated Access ─────────────────────────────────────────────────

    describe('When authenticated', () => {
        beforeEach(() => {
            cy.intercept('GET', '/api/students', { fixture: 'students.json' }).as('getStudents');
            cy.login();
            cy.wait('@getStudents');
        });

        // ─── Page Load ──────────────────────────────────────────────────────────

        describe('Page Load', () => {
            it('should display the student list header', () => {
                cy.contains('h5', 'Student List').should('be.visible');
            });

            it('should display all students returned by the API', () => {
                // 2 students from fixture
                cy.get('.student-row-grid, .student-card').should('have.length.at.least', 2);
            });

            it('should show student names from the fixture', () => {
                cy.contains('Alice').should('be.visible');
                cy.contains('Bob').should('be.visible');
            });

            it('should show student emails from the fixture', () => {
                cy.contains('alice@test.com').should('be.visible');
            });
        });

        // ─── Empty State ────────────────────────────────────────────────────────

        describe('Empty State', () => {
            it('should show an empty state when no students are returned', () => {
                cy.intercept('GET', '/api/students', { body: [] }).as('noStudents');
                cy.visit('/studentList');
                cy.wait('@noStudents');
                cy.get('.students-container').should('not.exist');
                cy.contains('No students').should('be.visible');
            });
        });

        // ─── Navigation ─────────────────────────────────────────────────────────

        describe('Navigation', () => {
            it('should navigate to student details when clicking View', () => {
                cy.intercept('GET', '/api/students/1', { fixture: 'student.json' }).as('getStudent');
                cy.get('button[title="View Details"]').first().click();
                cy.url().should('include', '/studentDetails/1');
            });

            it('should navigate to student edit when clicking Edit', () => {
                cy.intercept('GET', '/api/students/1', { fixture: 'student.json' }).as('getStudentEdit');
                cy.get('button[title="Edit Student"]').first().click();
                cy.url().should('include', '/studentEdit/1');
            });

            it('should navigate to student creation via the menu', () => {
                cy.intercept('GET', '/api/students', { fixture: 'students.json' });
                cy.get('.menu-toggle-btn').click();
                cy.contains('a', 'Create Student').click();
                cy.url().should('include', '/studentCreate');
            });
        });

        // ─── Delete Flow ────────────────────────────────────────────────────────

        describe('Delete Student', () => {
            it('should show a confirmation dialog when clicking Delete', () => {
                cy.get('button[title="Delete Student"]').first().click();
                cy.contains('Are you sure you want to delete this student?').should('be.visible');
                cy.contains('button', 'Confirm').should('be.visible');
                cy.contains('button', 'Cancel').should('be.visible');
            });

            it('should remove the student from the list after confirming delete', () => {
                cy.intercept('DELETE', '/api/students/1', {
                    statusCode: 204,
                    body: null,
                }).as('deleteStudent');

                cy.get('button[title="Delete Student"]').first().click();
                cy.contains('button', 'Confirm').click();
                cy.wait('@deleteStudent');

                // Alice (id=1) should no longer be in the list
                cy.contains('Alice').should('not.exist');
                cy.contains('deleted').should('be.visible');
            });

            it('should keep the student in the list when cancelling delete', () => {
                cy.get('button[title="Delete Student"]').first().click();
                cy.contains('button', 'Cancel').click();

                // Confirmation alert should be gone
                cy.contains('Are you sure you want to delete this student?').should('not.exist');
                // Student still visible
                cy.contains('Alice').should('be.visible');
            });
        });

        // ─── API Error ──────────────────────────────────────────────────────────

        describe('API Error', () => {
            it('should show an error message when the API fails to load students', () => {
                cy.intercept('GET', '/api/students', {
                    statusCode: 500,
                    body: { message: 'Internal server error' },
                }).as('errorStudents');

                cy.visit('/studentList');
                cy.wait('@errorStudents');
                cy.contains('Internal server error').should('be.visible');
            });
        });
    });
});
