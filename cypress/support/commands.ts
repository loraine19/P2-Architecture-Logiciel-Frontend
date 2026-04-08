/// <reference types="cypress" />

/**
 * E2E — Custom Commands
 *
 * Reusable Cypress commands shared across all spec files.
 * Loaded automatically via cypress/support/e2e.ts.
 */

export { };

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Log in via the UI (mocks the API).
             * Sets localStorage auth state so the Angular auth guard passes.
             */
            login(email?: string, password?: string): Chainable<void>;

            /**
             * Log out via the navigation menu (mocks the API).
             */
            logout(): Chainable<void>;
        }
    }
}

/** AUTH COMMANDS */

/* LOGIN */
// goes through the full login UI flow with a mocked API — app lands on /studentList
Cypress.Commands.add('login', (email = 'john@test.com', password = 'Password123!') => {
    // mock student list that the component loads right after login redirect
    cy.intercept('GET', '/api/students', { fixture: 'students.json' });

    cy.intercept('POST', '/api/login', {
        statusCode: 200,
        body: {
            success: true,
            message: 'Login successful',
            user: { firstName: 'John', lastName: 'Doe', login: email, password: '' },
            authType: 'COOKIE',
        },
    }).as('loginRequest');

    cy.visit('/login');
    cy.get('[formcontrolname="login"]').type(email);
    cy.get('[formcontrolname="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.wait('@loginRequest');
    // component has a 2-second delay before navigating after successful login
    cy.url({ timeout: 5000 }).should('include', '/studentList');
});

/* LOGOUT */
// opens the navigation menu and clicks Logout — app lands on /home
Cypress.Commands.add('logout', () => {
    cy.intercept('POST', '/api/logout', { statusCode: 200, body: {} }).as('logoutRequest');
    cy.get('.menu-toggle-btn').click();
    cy.contains('button', 'Logout').click();
    cy.wait('@logoutRequest');
    cy.url({ timeout: 5000 }).should('include', '/home');
});
