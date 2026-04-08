/// <reference types="cypress" />

/**
 * E2E — StudentCreateComponent
 *
 * Covers:
 *  - Auth guard: unauthenticated access → redirect to /home
 *  - Page load and form visibility
 *  - Form validation (required, email format, zipCode pattern)
 *  - Submit button disabled while form is invalid
 *  - Successful creation → success message + redirect to /studentList
 *  - API conflict (409) → error message shown
 *  - Form reset button
 *  - Back to list navigation
 */
describe('Student Create Page', () => {

    /** AUTH GUARD */

    describe('Auth Guard', () => {

        /* SHOULD REDIRECT UNAUTHENTICATED USER */
        it('should redirect unauthenticated user to /home', () => {
            cy.visit('/studentCreate');
            cy.url().should('include', '/home');
        });
    });

    /** WHEN AUTHENTICATED */

    describe('When authenticated', () => {

        // valid form data reused across tests
        const validStudent = {
            firstName: 'Alice',
            lastName: 'Martin',
            email: 'alice@test.com',
            phoneNumber: '0600000001',
            address: '10 rue des Lilas',
            city: 'Paris',
            zipCode: '75001',
        };

        // helper to fill all fields at once
        const fillForm = (data: typeof validStudent) => {
            cy.get('[formcontrolname="firstName"]').type(data.firstName);
            cy.get('[formcontrolname="lastName"]').type(data.lastName);
            cy.get('[formcontrolname="email"]').type(data.email);
            cy.get('[formcontrolname="phoneNumber"]').type(data.phoneNumber);
            cy.get('[formcontrolname="address"]').type(data.address);
            cy.get('[formcontrolname="city"]').type(data.city);
            cy.get('[formcontrolname="zipCode"]').type(data.zipCode);
        };

        /** BEFORE EACH */
        // log in and navigate to the create page before each test
        beforeEach(() => {
            cy.intercept('GET', '/api/students', { fixture: 'students.json' });
            cy.login();
            cy.visit('/studentCreate');
        });

        /** PAGE LOAD */

        describe('Page Load', () => {

            /* SHOULD DISPLAY THE CREATE STUDENT FORM */
            it('should display the create student form', () => {
                cy.contains('h5', 'Create Student').should('be.visible');
                cy.get('[formcontrolname="firstName"]').should('exist');
                cy.get('[formcontrolname="email"]').should('exist');
            });

            /* SHOULD START WITH AN EMPTY FORM */
            it('should start with an empty form', () => {
                cy.get('[formcontrolname="firstName"]').should('have.value', '');
                cy.get('[formcontrolname="email"]').should('have.value', '');
            });

            /* SHOULD HAVE SUBMIT BUTTON DISABLED ON LOAD */
            it('should have the submit button disabled on load', () => {
                cy.get('button[type="submit"]').should('be.disabled');
            });
        });

        /** FORM VALIDATION */

        describe('Form Validation', () => {

            /* SHOULD SHOW REQUIRED ERRORS WHEN FIELDS ARE TOUCHED AND EMPTY */
            it('should show required errors when fields are touched and empty', () => {
                cy.get('[formcontrolname="firstName"]').type('A').clear().blur();
                cy.contains('First name is required').should('be.visible');

                cy.get('[formcontrolname="lastName"]').type('A').clear().blur();
                cy.contains('Last name is required').should('be.visible');

                cy.get('[formcontrolname="email"]').type('A').clear().blur();
                cy.contains('Email is required').should('be.visible');
            });

            /* SHOULD SHOW EMAIL FORMAT ERROR FOR INVALID EMAIL */
            it('should show email format error for invalid email', () => {
                cy.get('[formcontrolname="email"]').type('not-an-email').blur();
                cy.contains('Invalid email format').should('be.visible');
            });

            /* SHOULD ENABLE SUBMIT BUTTON WHEN ALL FIELDS ARE VALID */
            it('should enable submit button when all fields are valid', () => {
                fillForm(validStudent);
                cy.get('button[type="submit"]').should('not.be.disabled');
            });
        });

        /** SUCCESSFUL CREATION */

        describe('Successful Creation', () => {

            /* SHOULD SHOW SUCCESS MESSAGE AFTER CREATING A STUDENT */
            it('should show a success message after creating a student', () => {
                cy.intercept('POST', '/api/students', {
                    statusCode: 201,
                    body: { id: 3, ...validStudent },
                }).as('createStudent');

                fillForm(validStudent);
                cy.get('button[type="submit"]').click();
                cy.wait('@createStudent');

                // full name appears in the success message
                cy.contains('Alice').should('be.visible');
                cy.contains('created').should('be.visible');
            });

            /* SHOULD REDIRECT TO STUDENTLIST AFTER CREATION */
            it('should redirect to /studentList after 2 seconds on success', () => {
                cy.intercept('GET', '/api/students', { fixture: 'students.json' });
                cy.intercept('POST', '/api/students', {
                    statusCode: 201,
                    body: { id: 3, ...validStudent },
                }).as('createStudent');

                fillForm(validStudent);
                cy.get('button[type="submit"]').click();
                cy.wait('@createStudent');
                // component delays 2 s before navigating after a successful creation
                cy.url({ timeout: 5000 }).should('include', '/studentList');
            });

            /* SHOULD POST CORRECT DATA TO API */
            it('should POST the correct data to /api/students', () => {
                cy.intercept('POST', '/api/students', (req) => {
                    expect(req.body.firstName).to.eq('Alice');
                    expect(req.body.email).to.eq('alice@test.com');
                    expect(req.body.zipCode).to.eq('75001');
                    req.reply({ statusCode: 201, body: { id: 3, ...req.body } });
                }).as('createStudent');

                fillForm(validStudent);
                cy.get('button[type="submit"]').click();
                cy.wait('@createStudent');
            });
        });

        /** CREATION FAILURE */

        describe('Creation Failure', () => {

            /* SHOULD SHOW ERROR ON API CONFLICT */
            it('should show an error message when the API returns a conflict (409)', () => {
                cy.intercept('POST', '/api/students', {
                    statusCode: 409,
                    body: { message: 'Email already exists' },
                }).as('conflictError');

                fillForm(validStudent);
                cy.get('button[type="submit"]').click();
                cy.wait('@conflictError');

                cy.contains('Email already exists').should('be.visible');
                // stay on create page after a failed attempt
                cy.url().should('include', '/studentCreate');
            });
        });

        /** FORM RESET */

        describe('Form Reset', () => {

            /* SHOULD RESET FORM WHEN CLICKING RESET */
            it('should reset the form when clicking Reset', () => {
                cy.get('[formcontrolname="firstName"]').type('Alice');
                cy.get('[formcontrolname="lastName"]').type('Martin');
                cy.contains('button', 'Reset').should('be.visible').click();
                cy.get('[formcontrolname="firstName"]').should('have.value', '');
                cy.get('[formcontrolname="lastName"]').should('have.value', '');
            });
        });

        /** BACK NAVIGATION */

        describe('Back Navigation', () => {

            /* SHOULD NAVIGATE TO STUDENTLIST WHEN CLICKING BACK */
            it('should navigate to /studentList when clicking Back to List', () => {
                // button has no text — only a mat-icon, so select by title attribute
                cy.get('button[title="Back to Student List"]').click();
                cy.url().should('include', '/studentList');
            });
        });
    });
});
