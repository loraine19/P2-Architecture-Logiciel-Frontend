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

    /** AUTH GUARD */

    describe('Auth Guard', () => {

        /* SHOULD REDIRECT UNAUTHENTICATED USER */
        it('should redirect unauthenticated user to /home', () => {
            cy.visit('/studentList');
            cy.url().should('include', '/home');
        });
    });

    /** WHEN AUTHENTICATED */

    describe('When authenticated', () => {

        /** BEFORE EACH */
        // log in — cy.login() already intercepts GET /api/students and the app redirects to this page
        beforeEach(() => {
            cy.intercept('GET', '/api/students', { fixture: 'students.json' }).as('getStudents');
            cy.login();
            // wait for cards to render rather than the alias (login consumed the first request)
            cy.get('.student-card').should('have.length.at.least', 1);
        });

        /** PAGE LOAD */

        describe('Page Load', () => {

            /* SHOULD DISPLAY STUDENT LIST HEADER */
            it('should display the student list header', () => {
                cy.contains('h5', 'Student List').should('be.visible');
            });

            /* SHOULD DISPLAY ALL STUDENTS FROM API */
            it('should display all students returned by the API', () => {
                // 2 students from fixture
                cy.get('.student-card').should('have.length.at.least', 2);
            });

            /* SHOULD SHOW STUDENT NAMES FROM FIXTURE */
            it('should show student names from the fixture', () => {
                // assert on the card to avoid the hidden mobile-only span
                cy.get('.student-card').first().should('contain.text', 'Alice');
                cy.get('.student-card').last().should('contain.text', 'Bob');
            });

            /* SHOULD SHOW STUDENT EMAILS FROM FIXTURE */
            it('should show student emails from the fixture', () => {
                // assert on the card to avoid the hidden mobile-only span
                cy.get('.student-card').first().should('contain.text', 'alice@test.com');
            });
        });

        /** EMPTY STATE */

        describe('Empty State', () => {

            /* SHOULD SHOW EMPTY STATE WHEN NO STUDENTS RETURNED */
            it('should show an empty state when no students are returned', () => {
                cy.intercept('GET', '/api/students', { body: [] }).as('noStudents');
                cy.visit('/studentList');
                cy.wait('@noStudents');
                cy.get('.students-container').should('not.exist');
                cy.contains('No Students Found').should('be.visible');
            });
        });

        /** NAVIGATION */

        describe('Navigation', () => {

            /* SHOULD NAVIGATE TO STUDENT DETAILS WHEN CLICKING VIEW */
            it('should navigate to student details when clicking View', () => {
                cy.intercept('GET', '/api/students/1', { fixture: 'student.json' }).as('getStudent');
                cy.get('button[title="View Details"]').first().click();
                cy.url().should('include', '/studentDetails/1');
            });

            /* SHOULD NAVIGATE TO STUDENT EDIT WHEN CLICKING EDIT */
            it('should navigate to student edit when clicking Edit', () => {
                cy.intercept('GET', '/api/students/1', { fixture: 'student.json' }).as('getStudentEdit');
                cy.get('button[title="Edit Student"]').first().click();
                cy.url().should('include', '/studentEdit/1');
            });

            /* SHOULD NAVIGATE TO STUDENT CREATION VIA MENU */
            it('should navigate to student creation via the menu', () => {
                cy.intercept('GET', '/api/students', { fixture: 'students.json' });
                cy.get('.menu-toggle-btn').click();
                cy.contains('a', 'Create Student').click();
                cy.url().should('include', '/studentCreate');
            });
        });

        /** DELETE STUDENT */

        describe('Delete Student', () => {

            /* SHOULD SHOW CONFIRMATION DIALOG WHEN CLICKING DELETE */
            it('should show a confirmation dialog when clicking Delete', () => {
                cy.get('button[title="Delete Student"]').first().click();
                cy.contains('Are you sure you want to delete this student?').should('be.visible');
                cy.contains('button', 'Confirm').should('be.visible');
                cy.contains('button', 'Cancel').should('be.visible');
            });

            /* SHOULD REMOVE STUDENT FROM LIST AFTER CONFIRMING DELETE */
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
                cy.contains('Student deleted successfully').should('be.visible');
            });

            /* SHOULD KEEP STUDENT IN LIST WHEN CANCELLING DELETE */
            it('should keep the student in the list when cancelling delete', () => {
                cy.get('button[title="Delete Student"]').first().click();
                cy.contains('button', 'Cancel').click();

                // confirmation alert should be gone
                cy.contains('Are you sure you want to delete this student?').should('not.exist');
                // student still visible (assert at card level to avoid hidden mobile span)
                cy.get('.student-card').first().should('contain.text', 'Alice');
            });
        });

        /** API ERROR */

        describe('API Error', () => {

            /* SHOULD SHOW ERROR MESSAGE WHEN API FAILS TO LOAD STUDENTS */
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
