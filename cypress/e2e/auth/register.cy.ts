/// <reference types="cypress" />

/**
 * E2E — RegisterComponent
 *
 * Covers:
 *  - Navigation to the register page
 *  - Form validation (required, minlength, pattern)
 *  - Successful registration → redirect to /login with success message
 *  - Duplicate email → API returns 400 → error message shown
 *  - Form reset button
 */
describe('Register Page', () => {
    beforeEach(() => {
        cy.visit('/register');
    });

    // ─── Navigation ───────────────────────────────────────────────────────────

    describe('Page Load', () => {
        it('should display the register form', () => {
            cy.contains('h5', 'Register').should('be.visible');
            cy.get('[formcontrolname="firstName"]').should('exist');
            cy.get('[formcontrolname="lastName"]').should('exist');
            cy.get('[formcontrolname="login"]').should('exist');
            cy.get('[formcontrolname="password"]').should('exist');
        });

        it('should have the submit button disabled when form is empty', () => {
            cy.get('button[type="submit"]').should('be.disabled');
        });

        it('should redirect an already logged-in user away from /register', () => {
            // Log in first so localStorage has auth state
            cy.login();
            cy.visit('/register');
            // The guestGuard should redirect to /studentList
            cy.url().should('include', '/studentList');
        });
    });

    // ─── Form Validation ──────────────────────────────────────────────────────

    describe('Form Validation', () => {
        it('should show required errors when submitting empty form fields', () => {
            // Type then clear to trigger touched+dirty state on each field
            cy.get('[formcontrolname="firstName"]').type('A').clear().blur();
            cy.contains('First name is required').should('be.visible');

            cy.get('[formcontrolname="lastName"]').type('A').clear().blur();
            cy.contains('Last name is required').should('be.visible');

            cy.get('[formcontrolname="login"]').type('A').clear().blur();
            cy.contains('Login is required').should('be.visible');

            cy.get('[formcontrolname="password"]').type('A').clear().blur();
            cy.contains('Password is required').should('be.visible');
        });

        it('should show minlength error for firstName shorter than 2 chars', () => {
            cy.get('[formcontrolname="firstName"]').type('A').blur();
            cy.contains('Must be at least 2 characters').should('be.visible');
        });

        it('should keep submit button disabled when the form is invalid', () => {
            cy.get('[formcontrolname="firstName"]').type('John');
            cy.get('[formcontrolname="lastName"]').type('Doe');
            cy.get('[formcontrolname="login"]').type('not-an-email');
            cy.get('[formcontrolname="password"]').type('Password123!');
            cy.get('button[type="submit"]').should('be.disabled');
        });

        it('should enable submit button when all fields are valid', () => {
            cy.get('[formcontrolname="firstName"]').type('John');
            cy.get('[formcontrolname="lastName"]').type('Doe');
            cy.get('[formcontrolname="login"]').type('john@test.com');
            cy.get('[formcontrolname="password"]').type('Password123!');
            cy.get('button[type="submit"]').should('not.be.disabled');
        });
    });

    // ─── Successful Registration ───────────────────────────────────────────────

    describe('Successful Registration', () => {
        it('should redirect to /login with a success message after registration', () => {
            cy.intercept('POST', '/api/register', {
                statusCode: 200,
                body: { message: 'User registered successfully' },
            }).as('registerRequest');

            cy.get('[formcontrolname="firstName"]').type('John');
            cy.get('[formcontrolname="lastName"]').type('Doe');
            cy.get('[formcontrolname="login"]').type('john@test.com');
            cy.get('[formcontrolname="password"]').type('Password123!');
            cy.get('button[type="submit"]').click();

            cy.wait('@registerRequest');
            cy.url({ timeout: 5000 }).should('include', '/login');
            cy.contains('Registration successful').should('be.visible');
        });

        it('should POST the correct data to /api/register', () => {
            cy.intercept('POST', '/api/register', (req) => {
                expect(req.body.firstName).to.eq('John');
                expect(req.body.lastName).to.eq('Doe');
                expect(req.body.login).to.eq('john@test.com');
                req.reply({ statusCode: 200, body: { message: 'OK' } });
            }).as('registerRequest');

            cy.get('[formcontrolname="firstName"]').type('John');
            cy.get('[formcontrolname="lastName"]').type('Doe');
            cy.get('[formcontrolname="login"]').type('john@test.com');
            cy.get('[formcontrolname="password"]').type('Password123!');
            cy.get('button[type="submit"]').click();
            cy.wait('@registerRequest');
        });
    });

    // ─── Registration Failure ─────────────────────────────────────────────────

    describe('Registration Failure', () => {
        it('should show error message when email is already taken (400)', () => {
            cy.intercept('POST', '/api/register', {
                statusCode: 400,
                body: { message: 'Login already exists' },
            }).as('registerFailure');

            cy.get('[formcontrolname="firstName"]').type('John');
            cy.get('[formcontrolname="lastName"]').type('Doe');
            cy.get('[formcontrolname="login"]').type('existing@test.com');
            cy.get('[formcontrolname="password"]').type('Password123!');
            cy.get('button[type="submit"]').click();

            cy.wait('@registerFailure');
            cy.contains('Login already exists').should('be.visible');
            cy.url().should('include', '/register'); // stays on the same page
        });

        it('should show generic error message on server error (500)', () => {
            cy.intercept('POST', '/api/register', {
                statusCode: 500,
                body: {},
            }).as('serverError');

            cy.get('[formcontrolname="firstName"]').type('John');
            cy.get('[formcontrolname="lastName"]').type('Doe');
            cy.get('[formcontrolname="login"]').type('john@test.com');
            cy.get('[formcontrolname="password"]').type('Password123!');
            cy.get('button[type="submit"]').click();

            cy.wait('@serverError');
            cy.contains('Internal server error').should('be.visible');
        });
    });

    // ─── Form Reset ───────────────────────────────────────────────────────────

    describe('Form Reset', () => {
        it('should reset the form when clicking the Reset button', () => {
            cy.get('[formcontrolname="firstName"]').type('John');
            cy.get('[formcontrolname="lastName"]').type('Doe');
            // Reset button appears only after form is dirty
            cy.contains('button', 'Reset').should('be.visible').click();
            cy.get('[formcontrolname="firstName"]').should('have.value', '');
        });
    });
});
