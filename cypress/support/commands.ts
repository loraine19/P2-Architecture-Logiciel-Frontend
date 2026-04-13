/// <reference types="cypress" />

/**
 * E2E — Custom Commands
 *
 * Credentials are taken from env vars (cypress.env.json or --env flags).
 * Defaults to john@test.com / Password123! — the pre-seeded test user.
 */

export { };

declare global {
    namespace Cypress {
        interface Chainable {
            /** Log in via the real UI — no network stubbing. */
            login(email?: string, password?: string): Chainable<void>;
            /** Log out via the real navigation menu. */
            logout(): Chainable<void>;
            /**
             * If a student card with the given firstName exists in /studentList,
             * click Delete → Confirm to remove it. No-op when the student is absent.
             * Requires being already logged in.
             */
            deleteStudentIfExists(firstName: string): Chainable<void>;
            /**
             * Find a student by exact email via the real API and delete it if found.
             * Handles its own authentication and clears cookies afterwards so the
             * caller's browser session stays clean.
             */
            deleteStudentByEmail(email: string): Chainable<void>;
        }
    }
}

/** AUTH COMMANDS */

/* LOGIN */
// Real UI flow — waits for the API response, then accommodates the 5s redirect timer.
Cypress.Commands.add('login', (
    email = Cypress.env('TEST_EMAIL') ?? 'john@test.com',
    password = Cypress.env('TEST_PASSWORD') ?? 'Password123!',
) => {
    cy.intercept('POST', '/api/login').as('_loginCmd');
    cy.visit('/login');
    cy.get('[formcontrolname="login"]').type(email);
    cy.get('[formcontrolname="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.wait('@_loginCmd');
    // The component redirects inside a setTimeout(5000) — give it enough margin.
    cy.url({ timeout: 8000 }).should('include', '/studentList');
});

/* LOGOUT */
Cypress.Commands.add('logout', () => {
    cy.get('.menu-toggle-btn').click();
    cy.contains('button', 'Logout').click();
    cy.url({ timeout: 5000 }).should('include', '/home');
});

/* DELETE STUDENT IF EXISTS */
// Visits /studentList, waits for the list to load, then deletes the matching card if found.
Cypress.Commands.add('deleteStudentIfExists', (firstName: string) => {
    cy.intercept('GET', '/api/students*').as('_studentsLoad');
    cy.visit('/studentList');
    cy.wait('@_studentsLoad');
    cy.get('body').then(($body) => {
        const hasCard = $body.find('.student-card').toArray()
            .some(card => card.textContent?.includes(firstName));
        if (hasCard) {
            cy.contains('.student-card', firstName)
                .find('button[title="Delete Student"]').click();
            cy.contains('button', 'Confirm').click();
            cy.contains('.student-card', firstName).should('not.exist');
        }
    });
});

/* DELETE STUDENT BY EMAIL */
// Finds and deletes a student by exact email via the real API.
// Authenticates via API first (POST /api/login) so no browser session is required.
// Clears cookies after completion so the caller's test starts from a clean state.
Cypress.Commands.add('deleteStudentByEmail', (email: string) => {
    // Authenticate via API — sets the session cookie for subsequent cy.request calls.
    cy.request('POST', '/api/login', {
        login: Cypress.env('TEST_EMAIL') ?? 'john@test.com',
        password: Cypress.env('TEST_PASSWORD') ?? 'Password123!',
        authType: 'COOKIE',
    });
    cy.request('GET', '/api/students').then((res) => {
        const student = (res.body as { email: string; id: number }[])
            .find(s => s.email === email);
        if (student) {
            cy.request({ method: 'DELETE', url: `/api/students/${student.id}`, failOnStatusCode: false });
        }
    });
    // Clear cookies so the caller's browser session stays clean.
    cy.clearCookies();
});
