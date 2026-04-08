/// <reference types="cypress" />

/**
 * E2E — LoginComponent
 *
 * Covers:
 *  - Page load and form visibility
 *  - Form validation (required, email format, password pattern)
 *  - Successful login → redirect to /studentList
 *  - Failed login (401) → error message shown
 *  - Network error → error message shown
 *  - Password visibility toggle
 *  - Form reset button
 *  - Redirect already-logged-in users away from /login
 *  - Logout flow
 */
describe('Login Page', () => {

    /** BEFORE EACH */
    // visit the login page before each test
    beforeEach(() => {
        cy.visit('/login');
    });

    /** PAGE LOAD */

    describe('Page Load', () => {

        /* SHOULD DISPLAY THE LOGIN FORM */
        it('should display the login form', () => {
            cy.contains('h5', 'Login').should('be.visible');
            cy.get('[formcontrolname="login"]').should('exist');
            cy.get('[formcontrolname="password"]').should('exist');
        });

        /* SHOULD HAVE SUBMIT BUTTON DISABLED WHEN FORM IS EMPTY */
        it('should have the submit button disabled when form is empty', () => {
            cy.get('button[type="submit"]').should('be.disabled');
        });

        /* SHOULD REDIRECT ALREADY LOGGED IN USER */
        it('should redirect an already-logged-in user away from /login', () => {
            cy.login();
            cy.visit('/login');
            // guestGuard redirects authenticated users to /studentList
            cy.url().should('include', '/studentList');
        });
    });

    /** FORM VALIDATION */

    describe('Form Validation', () => {

        /* SHOULD SHOW REQUIRED ERROR WHEN EMAIL IS CLEARED */
        it('should show required error when email field is cleared', () => {
            cy.get('[formcontrolname="login"]').type('a').clear().blur();
            cy.contains('Login is required').should('be.visible');
        });

        /* SHOULD SHOW EMAIL FORMAT ERROR FOR INVALID EMAIL */
        it('should show email format error for invalid email', () => {
            cy.get('[formcontrolname="login"]').type('not-an-email').blur();
            cy.contains('Please enter a valid email address').should('be.visible');
        });

        /* SHOULD SHOW REQUIRED ERROR WHEN PASSWORD IS CLEARED */
        it('should show required error when password field is cleared', () => {
            cy.get('[formcontrolname="password"]').type('a').clear().blur();
            cy.contains('Password is required').should('be.visible');
        });

        /* SHOULD SHOW MINLENGTH ERROR FOR SHORT PASSWORD */
        it('should show minlength error for short password', () => {
            cy.get('[formcontrolname="password"]').type('Ab1!').blur();
            cy.contains('Must be at least 8 characters').should('be.visible');
        });

        /* SHOULD SHOW PATTERN ERROR FOR PASSWORD WITHOUT UPPERCASE */
        it('should show pattern error for password without uppercase', () => {
            cy.get('[formcontrolname="password"]').type('lowercase123!').blur();
            cy.contains('Uppercase, lowercase, digit and special char required').should('be.visible');
        });

        /* SHOULD ENABLE SUBMIT BUTTON WHEN BOTH FIELDS ARE VALID */
        it('should enable submit button when both fields are valid', () => {
            cy.get('[formcontrolname="login"]').type('john@test.com');
            cy.get('[formcontrolname="password"]').type('Password123!');
            cy.get('button[type="submit"]').should('not.be.disabled');
        });
    });

    /** SUCCESSFUL LOGIN */

    describe('Successful Login', () => {

        /* SHOULD REDIRECT TO STUDENTLIST AFTER SUCCESSFUL LOGIN */
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
            // component waits 2 s before navigating after a successful login
            cy.url({ timeout: 5000 }).should('include', '/studentList');
        });

        /* SHOULD POST CORRECT CREDENTIALS TO API */
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

    /** FAILED LOGIN */

    describe('Failed Login', () => {

        /* SHOULD DISPLAY ERROR MESSAGE ON INVALID CREDENTIALS */
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
            // stay on login page after a failed attempt
            cy.url().should('include', '/login');
        });

        /* SHOULD DISPLAY NETWORK ERROR WHEN SERVER IS UNREACHABLE */
        it('should display a network error message when server is unreachable', () => {
            cy.intercept('POST', '/api/login', { forceNetworkError: true }).as('networkError');

            cy.get('[formcontrolname="login"]').type('john@test.com');
            cy.get('[formcontrolname="password"]').type('Password123!');
            cy.get('button[type="submit"]').click();

            cy.wait('@networkError');
            cy.contains('Unable to connect to the server').should('be.visible');
        });
    });

    /** PASSWORD VISIBILITY TOGGLE */

    describe('Password Visibility Toggle', () => {

        /* SHOULD TOGGLE PASSWORD FIELD TYPE */
        it('should toggle password field between type=password and type=text', () => {
            cy.get('[formcontrolname="password"]').should('have.attr', 'type', 'password');
            // use data-cy attribute on the mat-icon suffix to avoid fragile DOM traversal
            cy.get('[data-cy="toggle-password"]').click();
            cy.get('[formcontrolname="password"]').should('have.attr', 'type', 'text');
        });
    });

    /** FORM RESET */

    describe('Form Reset', () => {

        /* SHOULD RESET FORM WHEN CLICKING RESET BUTTON */
        it('should reset the form when clicking the Reset button', () => {
            cy.get('[formcontrolname="login"]').type('john@test.com');
            cy.get('[formcontrolname="password"]').type('Password123!');
            // reset button only appears when the form is dirty
            cy.contains('button', 'Reset').should('be.visible').click();
            cy.get('[formcontrolname="login"]').should('have.value', '');
            cy.get('[formcontrolname="password"]').should('have.value', '');
        });
    });

    /** LOGOUT */

    describe('Logout', () => {

        /* SHOULD NAVIGATE TO HOME AFTER LOGOUT */
        it('should navigate to /home after logout', () => {
            cy.login();
            cy.logout();
            cy.url().should('include', '/home');
        });

        /* SHOULD HIDE PROTECTED NAV LINKS AFTER LOGOUT */
        it('should hide protected nav links after logout', () => {
            cy.login();
            cy.logout();
            // open the menu to check which links are visible
            cy.get('.menu-toggle-btn').click();
            // authenticated-only links must be gone
            cy.contains('a', 'Student List').should('not.exist');
            cy.contains('a', 'Login').should('be.visible');
        });
    });
});

