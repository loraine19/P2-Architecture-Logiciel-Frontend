// Import custom Cypress commands
import './commands';

// Clear localStorage before each test to ensure test isolation
beforeEach(() => {
    cy.clearLocalStorage();
});
