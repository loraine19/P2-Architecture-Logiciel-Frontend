/// <reference types="cypress" />

import { AppNotification } from '../../../src/app/core/constants/appNotification';

/**
 * E2E — Register
 *
 * Real API calls only — no network stubbing.
 * Fixed test data lives in cypress/fixtures/test-user.json — no Date.now() timestamps.
 * Prerequisite: john@test.com exists in the DB (used for duplicate-email test).
 *
 * Covers:
 *  - Guest guard: authenticated user → /studentList
 *  - Successful registration → /login + success message
 *  - Duplicate email (real 400) → error message
 *
 * Cleanup strategy:
 *  The backend exposes DELETE /api/delete-test-user to remove the fixture user.
 *  It is called before the suite and before each registration attempt so the
 *  test is idempotent regardless of whether a previous run left data behind.
 */
describe('Register Page', () => {

    /**
     * Cleanup helper — authenticates via the API (session cookie), then calls
     * POST /api/delete-test-user with the fixture login as a plain-text body.
     * Clears cookies afterwards so the browser session stays clean.
     */
    const deleteFixtureUser = () => {
        cy.fixture('test-user').then((user) => {
            cy.request('POST', '/api/login', {
                login: Cypress.env('TEST_EMAIL') ?? 'john@test.com',
                password: Cypress.env('TEST_PASSWORD') ?? 'Password123!',
                authType: 'COOKIE',
            });
            cy.request({
                method: 'POST',
                url: '/api/delete-test-user',
                body: user.login,
                headers: { 'Content-Type': 'text/plain' },
                failOnStatusCode: false,
            });
            cy.clearCookies();
        });
    };

    // Remove any leftover fixture user before the whole suite starts.
    before(() => deleteFixtureUser());

    beforeEach(() => cy.visit('/register'));

    /** GUEST GUARD */

    describe('Guest Guard', () => {

        it('should redirect an already-logged-in user to /studentList', () => {
            cy.login();
            cy.visit('/register');
            cy.url().should('include', '/studentList');
        });
    });

    /** FORM VALIDATION */

    describe('Form Validation', () => {

        it('should show required errors when fields are touched and empty', () => {
            ['firstName', 'lastName', 'login', 'password'].forEach(field => {
                cy.get(`[formcontrolname="${field}"]`).focus().blur();
            });
            cy.get('mat-error').should('have.length.greaterThan', 0);
        });

        it('should show minlength error for short first name', () => {
            cy.get('[formcontrolname="firstName"]').type('A').blur();
            cy.get('mat-error').should('be.visible');
        });

        it('should show email format error for invalid login', () => {
            cy.get('[formcontrolname="login"]').type('not-valid').blur();
            cy.get('mat-error').should('be.visible');
        });

        it('should toggle password visibility', () => {
            cy.get('mat-icon[matsuffix]').click();
            cy.get('[formcontrolname="password"]').should('have.attr', 'type', 'text');
            cy.get('mat-icon[matsuffix]').click();
            cy.get('[formcontrolname="password"]').should('have.attr', 'type', 'password');
        });
    });

    /** SUCCESSFUL REGISTRATION */

    describe('Successful Registration', () => {

        // before() runs before the outer beforeEach (cy.visit) — correct cleanup order.
        // Mocha hook order: before() outer→inner, THEN beforeEach() outer→inner per test.
        before(() => deleteFixtureUser());

        it('should redirect to /login with success message after registration', () => {
            // Intercept registered before the fixture callback so it is in the command
            // queue before the form is submitted.
            cy.intercept('POST', '/api/register').as('registerReq');
            cy.fixture('test-user').then((user) => {
                cy.get('[formcontrolname="firstName"]').type(user.firstName);
                cy.get('[formcontrolname="lastName"]').type(user.lastName);
                cy.get('[formcontrolname="login"]').type(user.login);
                cy.get('[formcontrolname="password"]').type(user.password);
                cy.get('button[type="submit"]').click();
                // Wait for the real API, then allow 5 s for the 2 s redirect timer.
                cy.wait('@registerReq');
                cy.url({ timeout: 5000 }).should('include', '/login');
                cy.contains(AppNotification.REGISTRATION_SUCCESS).should('be.visible');
            });
        });
    });

    /** REGISTRATION FAILURE */

    describe('Registration Failure', () => {

        // john@test.com is the pre-seeded test user — registering it again returns real 400.
        it('should show error when email is already taken', () => {
            cy.intercept('POST', '/api/register').as('registerDupReq');
            cy.get('[formcontrolname="firstName"]').type('John');
            cy.get('[formcontrolname="lastName"]').type('Doe');
            cy.get('[formcontrolname="login"]').type('john@test.com');
            cy.get('[formcontrolname="password"]').type('Password123!');
            cy.get('button[type="submit"]').click();
            cy.wait('@registerDupReq').its('response.statusCode').should('eq', 400);
            cy.get('.alert-danger').should('be.visible');
            cy.url().should('include', '/register');
        });
    });
});
