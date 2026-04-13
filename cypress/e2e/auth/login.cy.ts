/// <reference types="cypress" />

/**
 * E2E — Login
 *
 * Real API calls only — no network stubbing.
 * Prerequisite: test user john@test.com / Password123! exists in the DB.
 *
 * Covers:
 *  - Guest guard: authenticated user → /studentList
 *  - Successful login → /studentList
 *  - Invalid credentials (real 401) → error message
 *  - Logout → /home
 *
 * Timing note:
 *  The login component redirects inside a setTimeout(5000 ms).
 *  cy.intercept is used to synchronise on the API response before asserting
 *  the URL so the assertion window starts only after the server has replied.
 */
describe('Login Page', () => {

    beforeEach(() => cy.visit('/login'));

    /** GUEST GUARD */

    describe('Guest Guard', () => {

        it('should redirect an already-logged-in user to /studentList', () => {
            cy.login();
            cy.visit('/login');
            cy.url().should('include', '/studentList');
        });
    });

    /** SUCCESSFUL LOGIN */

    describe('Successful Login', () => {

        it('should redirect to /studentList after correct credentials', () => {
            cy.intercept('POST', '/api/login').as('loginReq');
            cy.get('[formcontrolname="login"]').type('john@test.com');
            cy.get('[formcontrolname="password"]').type('Password123!');
            cy.get('button[type="submit"]').click();
            // Wait for the real API response, then allow 8 s for the 5 s redirect timer.
            cy.wait('@loginReq');
            cy.url({ timeout: 8000 }).should('include', '/studentList');
        });
    });

    /** FAILED LOGIN */

    describe('Failed Login', () => {

        it('should display error message on invalid credentials', () => {
            cy.intercept('POST', '/api/login').as('failedLogin');
            cy.get('[formcontrolname="login"]').type('nonexistent@nowhere.invalid');
            cy.get('[formcontrolname="password"]').type('WrongPass1!');
            cy.get('button[type="submit"]').click();
            // Wait for the real response — don't assert the status code (backend may return
            // 400 or 401 depending on implementation). Just verify the error banner appears.
            cy.wait('@failedLogin');
            cy.get('.alert-danger').should('be.visible');
            cy.url().should('include', '/login');
        });
    });

    /** LOGOUT */

    describe('Logout', () => {

        it('should navigate to /home after logout', () => {
            cy.login();
            cy.logout();
            cy.url().should('include', '/home');
        });
    });
});
