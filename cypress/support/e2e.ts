/// <reference types="cypress" />

/**
 * E2E — Global Setup
 *
 * Loaded before every spec file.
 * Applies overrides and hooks that apply to all tests.
 */

import './commands';
import '@cypress/code-coverage/support';

/** COMMAND OVERRIDES */

/* TYPE */
// Angular Material MDC floating label covers inputs - skip pointer-events check globally
Cypress.Commands.overwrite('type', (originalFn, subject, text, options) => {
    return originalFn(subject, text, { force: true, ...options });
});

/** HOOKS */

/* BEFORE EACH */
// reset localStorage before every test to guarantee isolation
beforeEach(() => {
    cy.clearLocalStorage();
});
