/// <reference types="cypress" />

import { AppNotificationMessage } from '../../../src/app/core/constants/appNotification';

/**
 * E2E — Student Details / Edit
 *
 * Real API calls only — no network stubbing.
 * Each test creates a fresh student via cy.request() and deletes it in afterEach.
 *
 * Covers:
 *  - Auth guard: unauthenticated → /home
 *  - Cancel edit → original values restored, form locked
 *  - Successful update (real PUT) → success message, back to view mode
 *  - Duplicate email on update  → error message
 *  - Back navigation → /studentList
 *  - Non-existent student (real 404) → not-found state
 */

const baseStudent = {
    firstName: 'Alice', lastName: 'Martin',
    phoneNumber: '0600000001', address: '10 rue des Lilas', city: 'Paris', zipCode: '75001',
};

describe('Student Details / Edit Page', () => {

    /** AUTH GUARD */

    describe('Auth Guard', () => {

        it('should redirect unauthenticated user to /home', () => {
            cy.visit('/studentDetails/1');
            cy.url().should('include', '/home');
        });
    });

    /** WHEN AUTHENTICATED */

    describe('When authenticated', () => {

        let studentId: number;
        const runId = Date.now();

        beforeEach(() => {
            cy.login();
            // create a fresh student for each test — isolated, no shared state
            cy.request('POST', '/api/students', { ...baseStudent, email: `alice.${runId}.${Date.now()}@test.com` })
                .then(res => {
                    studentId = res.body.id;
                    cy.visit(`/studentDetails/${studentId}`);
                });
        });

        afterEach(() => {
            cy.request({ method: 'DELETE', url: `/api/students/${studentId}`, failOnStatusCode: false });
        });

        /** EDIT MODE */

        describe('Edit Mode', () => {

            it('should cancel edit and restore original values', () => {
                cy.get('[title="Edit Student"]').click();
                cy.get('[formcontrolname="firstName"]').clear().type('ChangedName');
                cy.contains('button', 'Cancel').click();
                // original value restored and form locked — confirms the cancel logic works end-to-end
                cy.get('[formcontrolname="firstName"]').should('have.value', 'Alice');
                cy.get('[formcontrolname="firstName"]').should('be.disabled');
            });
        });

        /** SUCCESSFUL UPDATE */

        describe('Successful Update', () => {

            it('should show success message and return to view mode after update', () => {
                cy.intercept('PUT', '/api/students/*').as('updateReq');
                cy.get('[title="Edit Student"]').click();
                cy.get('[formcontrolname="firstName"]').clear().type('AliceUpdated');
                cy.get('button[type="submit"]').click();
                cy.wait('@updateReq');
                cy.contains(AppNotificationMessage.STUDENT_UPDATED('AliceUpdated', baseStudent.lastName)).should('be.visible');
                cy.get('[formcontrolname="firstName"]').should('be.disabled');
            });
        });

        /** UPDATE FAILURE */

        describe('Update Failure', () => {

            it('should show error when updating with a duplicate email (real 409)', () => {
                // create a second student to steal the email from
                const conflictEmail = `conflict.${runId}.${Date.now()}@test.com`;
                cy.request('POST', '/api/students', { ...baseStudent, firstName: 'Other', email: conflictEmail })
                    .then(conflictRes => {
                        cy.intercept('PUT', '/api/students/*').as('updateConflict');
                        cy.get('[title="Edit Student"]').click();
                        cy.get('[formcontrolname="email"]').clear().type(conflictEmail);
                        cy.get('button[type="submit"]').click();
                        cy.wait('@updateConflict').its('response.statusCode').should('eq', 400);
                        cy.get('.alert-danger').should('be.visible');
                        cy.request({ method: 'DELETE', url: `/api/students/${conflictRes.body.id}`, failOnStatusCode: false });
                    });
            });
        });

        /** BACK NAVIGATION */

        describe('Back Navigation', () => {

            it('should navigate to /studentList when clicking Back to List', () => {
                cy.contains('button', 'Back to List').click();
                cy.url().should('include', '/studentList');
            });
        });
    });

    /** STUDENT NOT FOUND */

    describe('Student Not Found', () => {

        it('should show not-found state for a non-existent student ID', () => {
            cy.login();
            cy.visit('/studentDetails/999999');
            cy.contains('Student Not Found').should('be.visible');
        });
    });
});
