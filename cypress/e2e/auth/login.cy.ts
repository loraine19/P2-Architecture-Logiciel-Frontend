/// <reference types="cypress" />

/**
 * E2E — LoginComponent
 *
 * Covers:
 *  - Navigation to the login page
 *  - Form validation (required, email, password pattern)
 *  - Successful login → redirect to /studentList
 *  - Failed login (401) → error message shown
 *  - Password visibility toggle
 *  - Redirect already-logged-in users
 *  - Logout flow
 */
describe('Login Page', () => {
    beforeEach(() => {
        cy.visit('/login');
    });

    // ─── Page Load ────────────────────────────────────────────────────────────

    describe('Page Load', () => {
        it('should display the login form', () => {
            cy.contains('h5', 'Login').should('be.visible');
            cy.get('[formcontrolname="login"]').should('exist');
            cy.get('[formcontrolname="password"]').should('exist');
        });

        it('should have the submit button disabled when form is empty', () => {
            cy.get('button[type="submit"]').should('be.disabled');
        });

        it('should redirect an already-logged-in user away from /login', () => {
            cy.login();
            cy.visit('/login');
            // guestGuard should redirect to /studentList
            cy.url().should('include', '/studentList');
        });
    });

    // ─── Form Validation ──────────────────────────────────────────────────────

    describe('Form Validation', () => {
        it('should show required error when email field is cleared', () => {
            cy.get('[formcontrolname="login"]').type('a').clear().blur();
            cy.contains('Login is required').should('be.visible');
        });

        it('should show email format error for invalid email', () => {
            cy.get('[formcontrolname="login"]').type('not-an-email').blur();
            cy.contains('Please enter a valid email address').should('be.visible');
        });

        it('should show required error when password field is cleared', () => {
            cy.get('[formcontrolname="password"]').type('a').clear().blur();
            cy.contains('Password is required').should('be.visible');
        });

        it('should show minlength error for short password', () => {
            cy.get('[formcontrolname="password"]').type('Ab1!').blur();
            cy.contains('Must be at least 8 characters').should('be.visible');
        });

        it('should show pattern error for password without uppercase', () => {
            cy.get('[formcontrolname="password"]').type('lowercase123!').blur();
            cy.contains('Uppercase, lowercase, digit and special char required').should('be.visible');
        });

        it('should enable submit button when both fields are valid', () => {
            cy.get('[formcontrolname="login"]').type('john@test.com');
            cy.get('[formcontrolname="password"]').type('Password123!');
            cy.get('button[type="submit"]').should('not.be.disabled');
        });
    });

    // ─── Successful Login ─────────────────────────────────────────────────────

    describe('Successful Login', () => {
        it('should redirect to /studentList after successful login', () => {
            cy.intercept('POST', '/api/login', {
                statusCode: 200,
                body: {
                    success: true,
                    message: 'Login successful',
                    user: { firstName: 'John', lastName: 'Doe', login: 'john@test.com', password: '' },
                    authType: 'COOKIE',
                },
            }).as('loginRequest');

            cy.get('[formcontrolname="login"]').type('john@test.com');
            cy.get('[formcontrolname="password"]').type('Password123!');
            cy.get('button[type="submit"]').click();

            cy.wait('@loginRequest');
            cy.url({ timeout: 5000 }).should('include', '/studentList');
        });

        it('should show a success message before redirecting', () => {
            cy.intercept('POST', '/api/login', {
                statusCode: 200,
                body: {
                    success: true,
                    message: 'Login successful',
                    user: { firstName: 'John', lastName: 'Doe', login: 'john@test.com', password: '' },
                    authType: 'COOKIE',
                },
            }).as('loginRequest');

            cy.get('[formcontrolname="login"]').type('john@test.com');
            cy.get('[formcontrolname="password"]').type('Password123!');
            cy.get('button[type="submit"]').click();
            cy.wait('@loginRequest');
            cy.contains('Login successful').should('be.visible');
        });

        it('should POST the correct credentials to /api/login', () => {
            cy.intercept('POST', '/api/login', (req) => {
                expect(req.body.login).to.eq('john@test.com');
                expect(req.body.password).to.eq('Password123!');
                req.reply({
                    statusCode: 200,
                    body: {
                        success: true,
                        message: 'Login successful',
                        user: { firstName: 'John', lastName: 'Doe', login: 'john@test.com', password: '' },
                        authType: 'COOKIE',
                    },
                });
            }).as('loginRequest');

            cy.get('[formcontrolname="login"]').type('john@test.com');
            cy.get('[formcontrolname="password"]').type('Password123!');
            cy.get('button[type="submit"]').click();
            cy.wait('@loginRequest');
        });
    });

    // ─── Failed Login ─────────────────────────────────────────────────────────

    describe('Failed Login', () => {
        it('should display an error message on invalid credentials (401)', () => {
            cy.intercept('POST', '/api/login', {
                statusCode: 401,
                body: { message: 'Invalid credentials' },
            }).as('loginFailure');

            cy.get('[formcontrolname="login"]').type('wrong@test.com');
            cy.get('[formcontrolname="password"]').type('WrongPass1!');
            cy.get('button[type="submit"]').click();

            cy.wait('@loginFailure');
            cy.contains('Invalid credentials').should('be.visible');
            cy.url().should('include', '/login'); // stays on the same page
        });

        it('should display a network error message when server is unreachable', () => {
            cy.intercept('POST', '/api/login', { forceNetworkError: true }).as('networkError');

            cy.get('[formcontrolname="login"]').type('john@test.com');
            cy.get('[formcontrolname="password"]').type('Password123!');
            cy.get('button[type="submit"]').click();

            cy.wait('@networkError');
            cy.contains('Unable to connect to the server').should('be.visible');
        });
    });

    // ─── Password Visibility Toggle ───────────────────────────────────────────

    describe('Password Visibility Toggle', () => {
        it('should toggle password field between type=password and type=text', () => {
            cy.get('[formcontrolname="password"]').should('have.attr', 'type', 'password');
            // Click the visibility toggle icon (mat-icon suffix)
            cy.get('mat-form-field').contains('[formcontrolname="password"]').parent().parent()
                .find('mat-icon[matsuffix]').click();
            cy.get('[formcontrolname="password"]').should('have.attr', 'type', 'text');
        });
    });

    // ─── Form Reset ───────────────────────────────────────────────────────────

    describe('Form Reset', () => {
        it('should reset the form when clicking the Reset button', () => {
            cy.get('[formcontrolname="login"]').type('john@test.com');
            cy.get('[formcontrolname="password"]').type('Password123!');
            cy.contains('button', 'Reset').should('be.visible').click();
            cy.get('[formcontrolname="login"]').should('have.value', '');
            cy.get('[formcontrolname="password"]').should('have.value', '');
        });
    });

    // ─── Logout Flow ──────────────────────────────────────────────────────────

    describe('Logout', () => {
        it('should navigate to /home after logout', () => {
            // First log in
            cy.login();
            // Then log out
            cy.logout();
            cy.url().should('include', '/home');
        });

        it('should hide protected nav links after logout', () => {
            cy.login();
            cy.logout();
            cy.get('.menu-toggle-btn').click();
            cy.contains('a', 'Student List').should('not.exist');
            cy.contains('a', 'Login').should('be.visible');
        });
    });
});
