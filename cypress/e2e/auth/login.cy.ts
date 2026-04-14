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
            // Wait for the real API response to verify the error banner appears.
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

    /** ERROR SERVICE */

    describe('Error Service', () => {

        // covers err.error?.message branch: server returns a message in the body
        it('should display the server-provided error message', () => {
            cy.intercept('POST', '/api/login', {
                statusCode: 403,
                body: { message: 'Account suspended' }
            }).as('loginWithBody');
            cy.get('[formcontrolname="login"]').type('john@test.com');
            cy.get('[formcontrolname="password"]').type('Password123!');
            cy.get('button[type="submit"]').click();
            cy.wait('@loginWithBody');
            cy.get('.alert-danger').should('contain', 'Account suspended');
        });

        it('should display error for status 403', () => {
            cy.intercept('POST', '/api/login', { statusCode: 403 }).as('loginForbidden');
            cy.get('[formcontrolname="login"]').type('john@test.com');
            cy.get('[formcontrolname="password"]').type('Password123!');
            cy.get('button[type="submit"]').click();
            cy.wait('@loginForbidden');
            cy.get('.alert-danger').should('be.visible');
        });

        it('should display error for status 404', () => {
            cy.intercept('POST', '/api/login', { statusCode: 404 }).as('loginNotFound');
            cy.get('[formcontrolname="login"]').type('john@test.com');
            cy.get('[formcontrolname="password"]').type('Password123!');
            cy.get('button[type="submit"]').click();
            cy.wait('@loginNotFound');
            cy.get('.alert-danger').should('be.visible');
        });

        it('should display error for status 500', () => {
            cy.intercept('POST', '/api/login', { statusCode: 500 }).as('loginServerError');
            cy.get('[formcontrolname="login"]').type('john@test.com');
            cy.get('[formcontrolname="password"]').type('Password123!');
            cy.get('button[type="submit"]').click();
            cy.wait('@loginServerError');
            cy.get('.alert-danger').should('be.visible');
        });

        it('should display error on network failure (status 0)', () => {
            cy.intercept('POST', '/api/login', { forceNetworkError: true }).as('networkError');
            cy.get('[formcontrolname="login"]').type('john@test.com');
            cy.get('[formcontrolname="password"]').type('Password123!');
            cy.get('button[type="submit"]').click();
            // no cy.wait for network errors — the error handler fires without a response
            cy.get('.alert-danger').should('be.visible');
        });

        it('should display generic error for unexpected status code', () => {
            cy.intercept('POST', '/api/login', { statusCode: 418 }).as('loginTeapot');
            cy.get('[formcontrolname="login"]').type('john@test.com');
            cy.get('[formcontrolname="password"]').type('Password123!');
            cy.get('button[type="submit"]').click();
            cy.wait('@loginTeapot');
            cy.get('.alert-danger').should('be.visible');
        });
    });

    /** FORM VALIDATION */

    describe('Form Validation', () => {

        it('should show required errors when fields are touched and empty', () => {
            cy.get('[formcontrolname="login"]').focus().blur();
            cy.get('[formcontrolname="password"]').focus().blur();
            cy.get('mat-error').should('have.length.greaterThan', 0);
        });

        it('should show email format error for invalid login value', () => {
            cy.get('[formcontrolname="login"]').type('not-an-email').blur();
            cy.get('mat-error').should('be.visible');
        });

        it('should toggle password visibility', () => {
            cy.get('[data-cy="toggle-password"]').click();
            cy.get('[formcontrolname="password"]').should('have.attr', 'type', 'text');
            cy.get('[data-cy="toggle-password"]').click();
            cy.get('[formcontrolname="password"]').should('have.attr', 'type', 'password');
        });
    });

    /** REDIRECT GUARD */

    describe('Redirect Guard', () => {

        it('should redirect an unauthenticated user from / to /home', () => {
            cy.visit('/');
            cy.url().should('include', '/home');
        });

        it('should redirect an authenticated user from / to /studentList', () => {
            cy.login();
            cy.visit('/');
            cy.url().should('include', '/studentList');
        });
    });
});
