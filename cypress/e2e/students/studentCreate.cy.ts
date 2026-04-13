/// <reference types="cypress" />

import { AppNotificationMessage } from '../../../src/app/core/constants/appNotification';

/**
 * E2E — Student Create
 *
 * Real API calls only — no network stubbing.
 * Fixed test data lives in cypress/fixtures/test-student.json and
 * cypress/fixtures/conflict-student.json — no Date.now() timestamps.
 *
 * Covers:
 *  - Auth guard: unauthenticated → /home
 *  - Successful creation → success message + redirect to /studentList
 *  - Duplicate email (real 409) → error message, stays on /studentCreate
 *  - Back navigation → /studentList
 *
 * Cleanup strategy:
 *  Before each scenario, cy.deleteStudentIfExists() visits /studentList and
 *  removes any leftover student card by first name so the test is idempotent.
 */
describe('Student Create Page', () => {

    /** AUTH GUARD */

    describe('Auth Guard', () => {

        it('should redirect unauthenticated user to /home', () => {
            cy.visit('/studentCreate');
            cy.url().should('include', '/home');
        });
    });

    /** WHEN AUTHENTICATED */

    describe('When authenticated', () => {

        const fillForm = (data: { firstName: string; lastName: string; email: string; phoneNumber: string; address: string; city: string; zipCode: string }) => {
            cy.get('[formcontrolname="firstName"]').type(data.firstName);
            cy.get('[formcontrolname="lastName"]').type(data.lastName);
            cy.get('[formcontrolname="email"]').type(data.email);
            cy.get('[formcontrolname="phoneNumber"]').type(data.phoneNumber);
            cy.get('[formcontrolname="address"]').type(data.address);
            cy.get('[formcontrolname="city"]').type(data.city);
            cy.get('[formcontrolname="zipCode"]').type(data.zipCode);
        };

        beforeEach(() => {
            cy.login();
            cy.visit('/studentCreate');
        });

        /** SUCCESSFUL CREATION */

        describe('Successful Creation', () => {

            // API-based cleanup: finds student by fixture email and deletes via API.
            // Runs before the outer beforeEach (cy.login + cy.visit) — Mocha hook order:
            // before() outer→inner first, THEN beforeEach() outer→inner per test.
            before(() => {
                cy.fixture('test-student').then((student) => {
                    cy.deleteStudentByEmail(student.email);
                });
            });

            it('should show success message and redirect to /studentList after creation', () => {
                // Intercept must be registered BEFORE the fixture callback to ensure it
                // is in the Cypress command queue before the form is submitted.
                cy.intercept('POST', '/api/students').as('createReq');
                cy.fixture('test-student').then((student) => {
                    fillForm(student);
                    cy.get('button[type="submit"]').click();
                    // cy.contains retries for up to 3 s — enough to catch the message
                    // before the component's 2 s redirect timer fires.
                    cy.contains(
                        AppNotificationMessage.STUDENT_CREATED(student.firstName, student.lastName),
                        { timeout: 3000 }
                    ).should('be.visible');
                    cy.url({ timeout: 5000 }).should('include', '/studentList');
                });
            });
        });

        /** CREATION FAILURE */

        describe('Creation Failure', () => {

            // Same API-based cleanup for the conflict student.
            before(() => {
                cy.fixture('conflict-student').then((student) => {
                    cy.deleteStudentByEmail(student.email);
                });
            });

            let conflictStudentId: number;

            beforeEach(() => {
                cy.fixture('conflict-student').then((student) => {
                    cy.request('POST', '/api/students', student)
                        .then(res => { conflictStudentId = res.body.id; });
                });
            });

            afterEach(() => {
                cy.request({ method: 'DELETE', url: `/api/students/${conflictStudentId}`, failOnStatusCode: false });
            });
            // check if better to throw 409 in back 
            it('should show error when email is already taken ', () => {
                cy.fixture('conflict-student').then((student) => {
                    cy.intercept('POST', '/api/students').as('createConflict');
                    fillForm({
                        firstName: 'Duplicate', lastName: 'Student', email: student.email,
                        phoneNumber: '0600000003', address: '3 rue Test', city: 'Paris', zipCode: '75002',
                    });
                    cy.get('button[type="submit"]').click();
                    cy.wait('@createConflict').its('response.statusCode').should('eq', 400);
                    cy.get('.alert-danger').should('be.visible');
                    cy.url().should('include', '/studentCreate');
                });
            });
        });

        /** BACK NAVIGATION */

        describe('Back Navigation', () => {

            it('should navigate to /studentList when clicking Back to List', () => {
                cy.get('button[title="Back to Student List"]').click();
                cy.url().should('include', '/studentList');
            });
        });
    });
});
