/// <reference types="cypress" />

/**
 * E2E — Student List
 *
 * Real API calls only — no network stubbing.
 * Data setup/teardown uses cy.request() against the real backend.
 *
 * Covers:
 *  - Auth guard: unauthenticated → /home
 *  - Navigation to student details, edit, and creation
 *  - Delete confirmed → student removed
 *  - Delete cancelled → student remains
 */
describe('Student List Page', () => {

    /** AUTH GUARD */

    describe('Auth Guard', () => {

        it('should redirect unauthenticated user to /home', () => {
            cy.visit('/studentList');
            cy.url().should('include', '/home');
        });
    });

    /** WHEN AUTHENTICATED */

    describe('When authenticated', () => {

        beforeEach(() => cy.login());

        /** NAVIGATION */

        describe('Navigation', () => {

            it('should close the menu when clicking a nav link', () => {
                cy.get('.menu-toggle-btn').click();
                cy.get('.side-menu').should('have.class', 'open');
                cy.contains('a', 'Home').click();
                cy.get('.side-menu').should('not.have.class', 'open');
            });

            it('should close the menu when clicking the overlay', () => {
                cy.get('.menu-toggle-btn').click();
                cy.get('.side-menu').should('have.class', 'open');
                cy.get('.side-menu-overlay').click({ force: true });
                cy.get('.side-menu').should('not.have.class', 'open');
            });

            it('should close the menu using the close button inside', () => {
                cy.get('.menu-toggle-btn').click();
                cy.get('.side-menu').should('have.class', 'open');
                cy.get('.close-btn').click();
                cy.get('.side-menu').should('not.have.class', 'open');
            });

            // assumes at least one student exists in the DB
            it('should navigate to student details when clicking View', () => {
                cy.get('button[title="View Details"]').first().click();
                cy.url().should('match', /\/studentDetails\/\d+/);
            });

            it('should navigate to student edit when clicking Edit', () => {
                cy.get('button[title="Edit Student"]').first().click();
                cy.url().should('match', /\/studentEdit\/\d+/);
            });

            it('should navigate to student creation via the menu', () => {
                cy.get('.menu-toggle-btn').click();
                cy.contains('a', 'Create Student').click();
                cy.url().should('include', '/studentCreate');
            });
        });

        /** DELETE STUDENT */

        describe('Delete Student', () => {

            // create a dedicated student for delete tests — cleaned up in afterEach
            let testStudentId: number;

            beforeEach(() => {
                cy.request('POST', '/api/students', {
                    firstName: 'ToDelete', lastName: 'Test',
                    email: `delete.${Date.now()}@test.com`,
                    phoneNumber: '0699999999', address: '1 rue Test', city: 'Paris', zipCode: '75001',
                }).then(res => {
                    testStudentId = res.body.id;
                    cy.visit('/studentList');
                });
            });

            afterEach(() => {
                // failOnStatusCode: false — student may already be deleted by the test
                cy.request({ method: 'DELETE', url: `/api/students/${testStudentId}`, failOnStatusCode: false });
            });

            it('should remove student from list after confirming delete', () => {
                cy.contains('.student-card', 'ToDelete')
                    .find('button[title="Delete Student"]').click();
                cy.contains('button', 'Confirm').click();
                cy.contains('ToDelete').should('not.exist');
                testStudentId = 0;
            });

            it('should keep student in list when cancelling delete', () => {
                cy.contains('.student-card', 'ToDelete')
                    .find('button[title="Delete Student"]').click();
                cy.contains('button', 'Cancel').click();
                cy.contains('ToDelete').should('exist');
            });
        });
    });

    /** AUTH INTERCEPTOR */

    describe('Auth Interceptor', () => {

        // intercept returns 401, refresh also returns 401 → handle401Error fires, session cleared, user redirected
        it('should redirect when session expires and refresh token is also rejected', () => {
            cy.login();
            cy.intercept('GET', '/api/students', { statusCode: 401 }).as('expiredSession');
            cy.intercept('POST', '/api/refresh', { statusCode: 401 }).as('expiredRefresh');
            cy.intercept('POST', '/api/logout', { statusCode: 200, body: {} }).as('logout');
            cy.visit('/studentList');
            cy.wait('@expiredSession');
            cy.wait('@expiredRefresh');
            cy.url({ timeout: 5000 }).should('not.include', '/studentList');
        });
    });
});
