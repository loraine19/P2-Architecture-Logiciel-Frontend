/// <reference types="cypress" />

/**
 * E2E — RegisterComponent
 *
 * Covers:
 *  - Page load and form visibility
 *  - Form validation (required, minlength, email format, password pattern)
 *  - Successful registration → redirect to /login with success message
 *  - Duplicate email → API returns 400 → error message shown
 *  - Server error (500) → generic error message shown
 *  - Form reset button
 *  - Redirect already-logged-in users away from /register
 */
describe('Register Page', () => {

    /** BEFORE EACH */
    // visit the register page before each test
    beforeEach(() => {
        cy.visit('/register');
    });

    /** PAGE LOAD */

    describe('Page Load', () => {

        /* SHOULD DISPLAY THE REGISTER FORM */
        it('should display the register form', () => {
            cy.contains('h5', 'Register').should('be.visible');
            cy.get('[formcontrolname="firstName"]').should('exist');
            cy.get('[formcontrolname="lastName"]').should('exist');
            cy.get('[formcontrolname="login"]').should('exist');
            cy.get('[formcontrolname="password"]').should('exist');
        });

        /* SHOULD HAVE SUBMIT BUTTON DISABLED WHEN FORM IS EMPTY */
        it('should have the submit button disabled when form is empty', () => {
            cy.get('button[type="submit"]').should('be.disabled');
        });

        /* SHOULD REDIRECT ALREADY LOGGED IN USER */
        it('should redirect an already logged-in user away from /register', () => {
            cy.login();
            cy.visit('/register');
            // guestGuard redirects authenticated users to /studentList
            cy.url().should('include', '/studentList');
        });
    });

    /** FORM VALIDATION */

    describe('Form Validation', () => {

        /* SHOULD SHOW REQUIRED ERRORS WHEN FIELDS ARE CLEARED */
        it('should show required errors when submitting empty form fields', () => {
            // type then clear to trigger touched+dirty state on each field
            cy.get('[formcontrolname="firstName"]').type('A').clear().blur();
            cy.contains('First name is required').should('be.visible');

            cy.get('[formcontrolname="lastName"]').type('A').clear().blur();
            cy.contains('Last name is required').should('be.visible');

            cy.get('[formcontrolname="login"]').type('A').clear().blur();
            cy.contains('Login is required').should('be.visible');

            cy.get('[formcontrolname="password"]').type('A').clear().blur();
            cy.contains('Password is required').should('be.visible');
        });

        /* SHOULD SHOW MINLENGTH ERROR FOR FIRSTNAME SHORTER THAN 2 CHARS */
        it('should show minlength error for firstName shorter than 2 chars', () => {
            cy.get('[formcontrolname="firstName"]').type('A').blur();
            cy.contains('Must be at least 2 characters').should('be.visible');
        });

        /* SHOULD KEEP SUBMIT BUTTON DISABLED WHEN FORM IS INVALID */
        it('should keep submit button disabled when the form is invalid', () => {
            cy.get('[formcontrolname="firstName"]').type('John');
            cy.get('[formcontrolname="lastName"]').type('Doe');
            // invalid email keeps the form invalid
            cy.get('[formcontrolname="login"]').type('not-an-email');
            cy.get('[formcontrolname="password"]').type('Password123!');
            cy.get('button[type="submit"]').should('be.disabled');
        });

        /* SHOULD ENABLE SUBMIT BUTTON WHEN ALL FIELDS ARE VALID */
        it('should enable submit button when all fields are valid', () => {
            cy.get('[formcontrolname="firstName"]').type('John');
            cy.get('[formcontrolname="lastName"]').type('Doe');
            cy.get('[formcontrolname="login"]').type('john@test.com');
            cy.get('[formcontrolname="password"]').type('Password123!');
            cy.get('button[type="submit"]').should('not.be.disabled');
        });
    });

    /** SUCCESSFUL REGISTRATION */

    describe('Successful Registration', () => {

        /* SHOULD REDIRECT TO LOGIN WITH SUCCESS MESSAGE */
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
            // component redirects to /login and passes the success message as a query param
            cy.url({ timeout: 5000 }).should('include', '/login');
            cy.contains('Registration successful').should('be.visible');
        });

        /* SHOULD POST CORRECT DATA TO API */
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

    /** REGISTRATION FAILURE */

    describe('Registration Failure', () => {

        /* SHOULD SHOW ERROR WHEN EMAIL IS ALREADY TAKEN */
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
            // stay on register page after a failed attempt
            cy.url().should('include', '/register');
        });

        /* SHOULD SHOW GENERIC ERROR ON SERVER ERROR */
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

    /** FORM RESET */

    describe('Form Reset', () => {

        /* SHOULD RESET FORM WHEN CLICKING RESET BUTTON */
        it('should reset the form when clicking the Reset button', () => {
            cy.get('[formcontrolname="firstName"]').type('John');
            cy.get('[formcontrolname="lastName"]').type('Doe');
            // reset button only appears when the form is dirty
            cy.contains('button', 'Reset').should('be.visible').click();
            cy.get('[formcontrolname="firstName"]').should('have.value', '');
        });
    });
});
