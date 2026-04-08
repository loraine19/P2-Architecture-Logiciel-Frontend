/// <reference types="cypress" />

/**
 * E2E — StudentDetailsComponent  (also covers the /studentEdit/:id route)
 *
 * Covers:
 *  - Auth guard: unauthenticated access → redirect to /home
 *  - Page load: student data displayed, form disabled in view mode
 *  - Toggle to edit mode: form enabled
 *  - Cancel edit: form reset to original values, back to view mode
 *  - Successful update → success message, back to view mode
 *  - API error during update → error message shown
 *  - Back to list navigation
 *  - Student not found (404) → not-found state shown
 */
describe('Student Details / Edit Page', () => {

    /** AUTH GUARD */

    describe('Auth Guard', () => {

        /* SHOULD REDIRECT UNAUTHENTICATED USER */
        it('should redirect unauthenticated user to /home', () => {
            cy.visit('/studentDetails/1');
            cy.url().should('include', '/home');
        });
    });

    /** WHEN AUTHENTICATED */

    describe('When authenticated', () => {

        /** BEFORE EACH */
        // log in and load student #1 before each test
        beforeEach(() => {
            cy.intercept('GET', '/api/students', { fixture: 'students.json' });
            cy.intercept('GET', '/api/students/1', { fixture: 'student.json' }).as('getStudent');
            cy.login();
            cy.visit('/studentDetails/1');
            cy.wait('@getStudent');
        });

        /** VIEW MODE */

        describe('View Mode', () => {

            /* SHOULD DISPLAY STUDENT NAME IN HEADER */
            it('should display the student name in the header', () => {
                cy.contains('Alice').should('be.visible');
                cy.contains('Martin').should('be.visible');
            });

            /* SHOULD POPULATE FORM WITH STUDENT DATA */
            it('should populate the form with the student data', () => {
                cy.get('[formcontrolname="firstName"]').should('have.value', 'Alice');
                cy.get('[formcontrolname="email"]').should('have.value', 'alice@test.com');
                cy.get('[formcontrolname="city"]').should('have.value', 'Paris');
            });

            /* SHOULD START WITH FORM DISABLED */
            it('should start with the form disabled (view mode)', () => {
                // inputs are disabled in view mode
                cy.get('[formcontrolname="firstName"]').should('be.disabled');
            });

            /* SHOULD SHOW EDIT TOGGLE BUTTON */
            it('should show an Edit toggle button', () => {
                cy.get('[title="Edit Student"]').should('be.visible');
            });
        });

        /** EDIT MODE */

        describe('Edit Mode', () => {

            /** BEFORE EACH */
            // click the edit toggle before each test in this group
            beforeEach(() => {
                cy.get('[title="Edit Student"]').click();
            });

            /* SHOULD ENABLE FORM AFTER CLICKING EDIT */
            it('should enable the form after clicking Edit', () => {
                cy.get('[formcontrolname="firstName"]').should('not.be.disabled');
                cy.get('[formcontrolname="email"]').should('not.be.disabled');
            });

            /* SHOULD SHOW EDIT STUDENT IN HEADER */
            it('should show "Edit Student" in the header when in edit mode', () => {
                cy.contains('Edit Student').should('be.visible');
            });

            /* SHOULD CANCEL EDIT AND RESTORE ORIGINAL VALUES */
            it('should cancel edit and restore original values', () => {
                cy.get('[formcontrolname="firstName"]').clear().type('ChangedName');
                cy.contains('button', 'Cancel').click();

                // original value restored and form locked again
                cy.get('[formcontrolname="firstName"]').should('have.value', 'Alice');
                cy.get('[formcontrolname="firstName"]').should('be.disabled');
            });
        });

        /** SUCCESSFUL UPDATE */

        describe('Successful Update', () => {

            /* SHOULD SHOW SUCCESS MESSAGE AFTER UPDATING */
            it('should show a success message after updating the student', () => {
                cy.intercept('PUT', '/api/students/1', {
                    statusCode: 200,
                    body: {
                        id: 1, firstName: 'AliceUpdated', lastName: 'Martin', email: 'alice@test.com',
                        phoneNumber: '0600000001', address: '10 rue des Lilas', city: 'Paris', zipCode: '75001'
                    },
                }).as('updateStudent');

                cy.get('[title="Edit Student"]').click();
                cy.get('[formcontrolname="firstName"]').clear().type('AliceUpdated');
                cy.get('button[type="submit"]').click();

                cy.wait('@updateStudent');
                cy.contains('updated').should('be.visible');
            });

            /* SHOULD RETURN TO VIEW MODE AFTER SUCCESSFUL UPDATE */
            it('should return to view mode after a successful update', () => {
                cy.intercept('PUT', '/api/students/1', {
                    statusCode: 200,
                    body: {
                        id: 1, firstName: 'AliceUpdated', lastName: 'Martin', email: 'alice@test.com',
                        phoneNumber: '0600000001', address: '10 rue des Lilas', city: 'Paris', zipCode: '75001'
                    },
                }).as('updateStudent');

                cy.get('[title="Edit Student"]').click();
                cy.get('[formcontrolname="firstName"]').clear().type('AliceUpdated');
                cy.get('button[type="submit"]').click();
                cy.wait('@updateStudent');

                // form is disabled again after a successful update
                cy.get('[formcontrolname="firstName"]').should('be.disabled');
            });

            /* SHOULD PUT CORRECT DATA TO API */
            it('should PUT the correct data to /api/students/:id', () => {
                cy.intercept('PUT', '/api/students/1', (req) => {
                    expect(req.body.firstName).to.eq('AliceUpdated');
                    expect(req.body.email).to.eq('alice@test.com');
                    req.reply({ statusCode: 200, body: { id: 1, ...req.body } });
                }).as('updateStudent');

                cy.get('[title="Edit Student"]').click();
                cy.get('[formcontrolname="firstName"]').clear().type('AliceUpdated');
                cy.get('button[type="submit"]').click();
                cy.wait('@updateStudent');
            });
        });

        /** UPDATE FAILURE */

        describe('Update Failure', () => {

            /* SHOULD SHOW ERROR MESSAGE WHEN UPDATE FAILS */
            it('should show an error message when update fails (409 conflict)', () => {
                cy.intercept('PUT', '/api/students/1', {
                    statusCode: 409,
                    body: { message: 'Email already used by another student' },
                }).as('updateConflict');

                cy.get('[title="Edit Student"]').click();
                cy.get('[formcontrolname="email"]').clear().type('existing@test.com');
                cy.get('button[type="submit"]').click();
                cy.wait('@updateConflict');

                cy.contains('Email already used').should('be.visible');
            });
        });

        /** BACK NAVIGATION */

        describe('Back Navigation', () => {

            /* SHOULD NAVIGATE TO STUDENTLIST WHEN CLICKING BACK TO LIST */
            it('should navigate to /studentList when clicking Back to List', () => {
                cy.contains('button', 'Back to List').click();
                cy.url().should('include', '/studentList');
            });
        });
    });

    /** STUDENT NOT FOUND */

    describe('Student Not Found', () => {

        /* SHOULD SHOW NOT FOUND STATE WHEN STUDENT DOES NOT EXIST */
        it('should show a not-found state when student does not exist', () => {
            cy.intercept('GET', '/api/students', { fixture: 'students.json' });
            cy.intercept('GET', '/api/students/999', {
                statusCode: 404,
                body: { message: 'Student not found' },
            }).as('notFound');

            cy.login();
            cy.visit('/studentDetails/999');
            cy.wait('@notFound');
            cy.contains('Student Not Found').should('be.visible');
            cy.contains('Back to Student List').should('be.visible');
        });
    });
});
