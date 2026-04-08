/// <reference types="cypress" />

/**
 * E2E — StudentDetailsComponent  (also covers the /studentEdit/:id route)
 *
 * Covers:
 *  - Auth guard: unauthenticated access → redirect to /home
 *  - Page load — student data displayed, form disabled in view mode
 *  - Toggle to edit mode — form enabled
 *  - Cancel edit — form reset to original values, back to view mode
 *  - Successful update → success message, back to view mode
 *  - API error during update → error message shown
 *  - Back to list navigation
 *  - Student not found (404) → not-found state shown
 */
describe('Student Details / Edit Page', () => {
    // ─── Auth Guard ───────────────────────────────────────────────────────────

    describe('Auth Guard', () => {
        it('should redirect unauthenticated user to /home', () => {
            cy.visit('/studentDetails/1');
            cy.url().should('include', '/home');
        });
    });

    // ─── Authenticated Access ─────────────────────────────────────────────────

    describe('When authenticated', () => {
        beforeEach(() => {
            cy.intercept('GET', '/api/students', { fixture: 'students.json' });
            cy.intercept('GET', '/api/students/1', { fixture: 'student.json' }).as('getStudent');
            cy.login();
            cy.visit('/studentDetails/1');
            cy.wait('@getStudent');
        });

        // ─── Page Load — View Mode ───────────────────────────────────────────────

        describe('View Mode', () => {
            it('should display the student name in the header', () => {
                cy.contains('Alice').should('be.visible');
                cy.contains('Martin').should('be.visible');
            });

            it('should populate the form with the student data', () => {
                cy.get('[formcontrolname="firstName"]').should('have.value', 'Alice');
                cy.get('[formcontrolname="email"]').should('have.value', 'alice@test.com');
                cy.get('[formcontrolname="city"]').should('have.value', 'Paris');
            });

            it('should start with the form disabled (view mode)', () => {
                // In view mode, inputs are readonly / form is disabled
                cy.get('[formcontrolname="firstName"]').should('be.disabled');
            });

            it('should show an Edit toggle button', () => {
                // The edit toggle is a mat-icon-button
                cy.get('[title="Edit Student"]').should('be.visible');
            });
        });

        // ─── Toggle to Edit Mode ─────────────────────────────────────────────────

        describe('Edit Mode', () => {
            beforeEach(() => {
                cy.get('[title="Edit Student"]').click();
            });

            it('should enable the form after clicking Edit', () => {
                cy.get('[formcontrolname="firstName"]').should('not.be.disabled');
                cy.get('[formcontrolname="email"]').should('not.be.disabled');
            });

            it('should show "Edit Student" in the header when in edit mode', () => {
                cy.contains('Edit Student').should('be.visible');
            });

            it('should cancel edit and restore original values', () => {
                cy.get('[formcontrolname="firstName"]').clear().type('ChangedName');
                cy.contains('button', 'Cancel').click();

                cy.get('[formcontrolname="firstName"]').should('have.value', 'Alice');
                cy.get('[formcontrolname="firstName"]').should('be.disabled'); // back to view mode
            });
        });

        // ─── Successful Update ───────────────────────────────────────────────────

        describe('Successful Update', () => {
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

                // After update, form should be disabled again (view mode)
                cy.get('[formcontrolname="firstName"]').should('be.disabled');
            });

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

        // ─── Update Failure ──────────────────────────────────────────────────────

        describe('Update Failure', () => {
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

        // ─── Back Navigation ─────────────────────────────────────────────────────

        describe('Back Navigation', () => {
            it('should navigate to /studentList when clicking Back to List', () => {
                cy.contains('button', 'Back to Student List').click();
                cy.url().should('include', '/studentList');
            });

            it('should navigate to /studentList when cancelling from view mode', () => {
                cy.contains('button', 'Cancel').click();
                cy.url().should('include', '/studentList');
            });
        });
    });

    // ─── Student Not Found ────────────────────────────────────────────────────

    describe('Student Not Found', () => {
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
