// Cypress global type declarations
/// <reference types="cypress" />

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

// ─── AUTH COMMANDS ────────────────────────────────────────────────────────────

/**
 * cy.login()
 *
 * Goes through the full login UI flow with a mocked API response.
 * After calling this command, localStorage["authState"] is set and
 * the app is on /studentList. Use this in beforeEach() of tests that
 * require an authenticated user.
 */
Cypress.Commands.add('login', (email = 'john@test.com', password = 'Password123!') => {
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
    // The component has a 2-second delay before navigating
    cy.url({ timeout: 5000 }).should('include', '/studentList');
});

/**
 * cy.logout()
 *
 * Opens the navigation menu and clicks the Logout button (mocks the API).
 * After this command the app is on /home.
 */
Cypress.Commands.add('logout', () => {
    cy.intercept('POST', '/api/logout', { statusCode: 200, body: {} }).as('logoutRequest');
    cy.get('.menu-toggle-btn').click();
    cy.contains('button', 'Logout').click();
    cy.wait('@logoutRequest');
    cy.url({ timeout: 5000 }).should('include', '/home');
});
