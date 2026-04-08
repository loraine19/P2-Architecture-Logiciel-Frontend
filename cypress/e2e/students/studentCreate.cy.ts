/// <reference types="cypress" />

/**
 * E2E — StudentCreateComponent
 *
 * Covers:
 *  - Auth guard: unauthenticated access → redirect to /home
 *  - Form validation (required, email, zipCode pattern)
 *  - Submit disabled while form is invalid
 *  - Successful creation → success message + redirect to /studentList
 *  - API error during creation → error message shown
 *  - Form reset
 *  - Back to list navigation
 */
describe('Student Create Page', () => {
    // ─── Auth Guard ───────────────────────────────────────────────────────────

    describe('Auth Guard', () => {
        it('should redirect unauthenticated user to /home', () => {
            cy.visit('/studentCreate');
            cy.url().should('include', '/home');
        });
    });

    // ─── Authenticated Access ─────────────────────────────────────────────────

    describe('When authenticated', () => {
        // Valid form data reused across tests
        const validStudent = {
            firstName: 'Alice',
            lastName: 'Martin',
            email: 'alice@test.com',
            phoneNumber: '0600000001',
            address: '10 rue des Lilas',
            city: 'Paris',
            zipCode: '75001',
        };

        const fillForm = (data: typeof validStudent) => {
            cy.get('[formcontrolname="firstName"]').type(data.firstName);
            cy.get('[formcontrolname="lastName"]').type(data.lastName);
            cy.get('[formcontrolname="email"]').type(data.email);
            cy.get('[formcontrolname="phoneNumber"]').type(data.phoneNumber);
            cy.get('[formcontrolname="address"]').type(data.address);
            cy.get('[formcontrolname="city"]').type(data.city);
            cy.get('[formcontrolname="zipCode"]').type(data.zipCode);
        };

        beforeEach(() => {
            cy.intercept('GET', '/api/students', { fixture: 'students.json' });
            cy.login();
            cy.visit('/studentCreate');
        });

        // ─── Page Load ──────────────────────────────────────────────────────────

        describe('Page Load', () => {
            it('should display the create student form', () => {
                cy.contains('h5', 'Create Student').should('be.visible');
                cy.get('[formcontrolname="firstName"]').should('exist');
                cy.get('[formcontrolname="email"]').should('exist');
            });

            it('should start with an empty form', () => {
                cy.get('[formcontrolname="firstName"]').should('have.value', '');
                cy.get('[formcontrolname="email"]').should('have.value', '');
            });

            it('should have the submit button disabled on load', () => {
                cy.get('button[type="submit"]').should('be.disabled');
            });
        });

        // ─── Form Validation ────────────────────────────────────────────────────

        describe('Form Validation', () => {
            it('should show required errors when fields are touched and empty', () => {
                cy.get('[formcontrolname="firstName"]').type('A').clear().blur();
                cy.contains('First name is required').should('be.visible');

                cy.get('[formcontrolname="lastName"]').type('A').clear().blur();
                cy.contains('Last name is required').should('be.visible');

                cy.get('[formcontrolname="email"]').type('A').clear().blur();
                cy.contains('Email is required').should('be.visible');
            });

            it('should show email format error for invalid email', () => {
                cy.get('[formcontrolname="email"]').type('not-an-email').blur();
                cy.contains('Invalid email format').should('be.visible');
            });

            it('should show pattern error for zipCode that is not 5 digits', () => {
                cy.get('[formcontrolname="zipCode"]').type('123').blur();
                // submit to show validation errors
                cy.get('button[type="submit"]').click();
                cy.get('[formcontrolname="zipCode"]').should('exist');
            });

            it('should enable submit button when all fields are valid', () => {
                fillForm(validStudent);
                cy.get('button[type="submit"]').should('not.be.disabled');
            });
        });

        // ─── Successful Creation ────────────────────────────────────────────────

        describe('Successful Creation', () => {
            it('should show a success message after creating a student', () => {
                cy.intercept('POST', '/api/students', {
                    statusCode: 201,
                    body: { id: 3, ...validStudent },
                }).as('createStudent');

                fillForm(validStudent);
                cy.get('button[type="submit"]').click();
                cy.wait('@createStudent');

                cy.contains('Alice').should('be.visible'); // name appears in the success message
                cy.contains('created').should('be.visible');
            });

            it('should redirect to /studentList after 2 seconds on success', () => {
                cy.intercept('GET', '/api/students', { fixture: 'students.json' });
                cy.intercept('POST', '/api/students', {
                    statusCode: 201,
                    body: { id: 3, ...validStudent },
                }).as('createStudent');

                fillForm(validStudent);
                cy.get('button[type="submit"]').click();
                cy.wait('@createStudent');
                cy.url({ timeout: 5000 }).should('include', '/studentList');
            });

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

        // ─── Creation Failure ───────────────────────────────────────────────────

        describe('Creation Failure', () => {
            it('should show an error message when the API returns a conflict (409)', () => {
                cy.intercept('POST', '/api/students', {
                    statusCode: 409,
                    body: { message: 'Email already exists' },
                }).as('conflictError');

                fillForm(validStudent);
                cy.get('button[type="submit"]').click();
                cy.wait('@conflictError');

                cy.contains('Email already exists').should('be.visible');
                cy.url().should('include', '/studentCreate'); // stays on the same page
            });
        });

        // ─── Form Reset ─────────────────────────────────────────────────────────

        describe('Form Reset', () => {
            it('should reset the form when clicking Reset', () => {
                cy.get('[formcontrolname="firstName"]').type('Alice');
                cy.get('[formcontrolname="lastName"]').type('Martin');
                cy.contains('button', 'Reset').should('be.visible').click();
                cy.get('[formcontrolname="firstName"]').should('have.value', '');
                cy.get('[formcontrolname="lastName"]').should('have.value', '');
            });
        });

        // ─── Back Navigation ────────────────────────────────────────────────────

        describe('Back Navigation', () => {
            it('should navigate to /studentList when clicking Back to List', () => {
                cy.contains('button', 'Back').click();
                cy.url().should('include', '/studentList');
            });
        });
    });
});
