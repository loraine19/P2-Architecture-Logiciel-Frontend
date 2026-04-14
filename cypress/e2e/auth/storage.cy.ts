/// <reference types="cypress" />

/**
 * E2E — AdaptiveStorage + UserService + AuthInterceptor (mobile paths)
 *
 * Strategy A — localStorage edge cases (web, always reachable):
 *   getAuthState()    : catch branch → invalid JSON in localStorage
 *   getAuthStateUser(): catch branch + null-user branch
 *
 * Strategy B — DEV_MODE localStorage fallback (simulated mobile):
 *   Setting `window.Capacitor = {}` in `onBeforeLoad` makes
 *   PlatformDetectionService.isMobile() return true for the whole page lifecycle.
 *   Since window.SecureStorage is absent, AdaptiveStorageService falls through
 *   to the DEV_MODE localStorage path for every token operation.
 *
 *   Covers:
 *     setAuthToken / storeMobileToken              (HEADER login mock)
 *     setAuthRefreshToken / storeMobileRefreshToken (HEADER login mock)
 *     extractTokenFromResponse                     (HEADER login mock)
 *     processLoginResponse — HEADER+mobile branch  (HEADER login mock)
 *     getAuthToken / getMobileToken                (protected-page request)
 *     getAuthRefreshToken / getMobileRefreshToken  (401→refresh flow)
 *     clearAuthData / clearMobileStorage           (logout in mobile mode)
 *     AuthInterceptor — mobile request path        (Capacitor set)
 *     AuthInterceptor — handle401Error mobile path (401→refresh→retry)
 *     UserService — refreshAccessToken mobile path (401→refresh flow)
 */

const MOCK_USER = { id: 1, login: 'john@test.com', firstName: 'John', lastName: 'Test' };

describe('AdaptiveStorage Service', () => {

    beforeEach(() => cy.clearLocalStorage());

    /** STRATEGY A — localStorage edge cases (no mobile simulation needed) */

    describe('getAuthState — edge cases', () => {

        it('should return false and redirect to /home when authState is invalid JSON', () => {
            cy.visit('/', {
                onBeforeLoad: win => win.localStorage.setItem('authState', '!!!not-valid-json')
            });
            // redirectGuard → isLoggedIn() → getAuthState() → JSON.parse throws → false → /home
            cy.url().should('include', '/home');
        });
    });

    describe('getAuthStateUser — edge cases', () => {

        it('should tolerate missing user field in authState', () => {
            // isLoggedIn() returns true but getCurrentUser() returns null (user field absent)
            cy.intercept('GET', '/api/students', { statusCode: 200, body: [] }).as('students');
            cy.visit('/studentList', {
                onBeforeLoad: win => {
                    win.localStorage.setItem('authState', JSON.stringify({ isLoggedIn: true }));
                }
            });
            cy.wait('@students');
            cy.url().should('include', '/studentList');
        });

        it('should redirect to /home when authState user field contains invalid JSON', () => {
            cy.visit('/studentList', {
                onBeforeLoad: win => win.localStorage.setItem('authState', '!!!not-valid-json')
            });
            // isLoggedIn() also returns false with bad JSON → authGuard → /home
            cy.url().should('include', '/home');
        });
    });

    /** STRATEGY B — DEV_MODE localStorage fallback (Capacitor simulation) */

    describe('DEV_MODE — localStorage fallback (Capacitor simulation)', () => {

        /**
         * Simulates a successful HEADER-type login on mobile.
         * Covers: processLoginResponse (HEADER+mobile branch),
         *         extractTokenFromResponse, setAuthToken, storeMobileToken,
         *         setAuthRefreshToken, storeMobileRefreshToken,
         *         UserService.setAuthToken, UserService.setAuthRefreshToken
         */
        it('should store JWT and refresh token via localStorage after HEADER login', () => {
            cy.intercept('POST', '/api/login', req => {
                req.reply({
                    statusCode: 200,
                    headers: { 'Authorization': 'Bearer fake_jwt_token' },
                    body: {
                        success: true,
                        authType: 'HEADER',
                        refreshToken: 'fake_refresh_token',
                        user: MOCK_USER
                    }
                });
            }).as('mobileLogin');

            cy.visit('/login', {
                onBeforeLoad: win => { (win as any).Capacitor = {}; }
            });
            cy.get('[formcontrolname="login"]').type('john@test.com');
            cy.get('[formcontrolname="password"]').type('Password123!');
            cy.get('button[type="submit"]').click();
            cy.wait('@mobileLogin');

            // processLoginResponse runs async — use should() for automatic retry
            cy.window().should(win => {
                expect(win.localStorage.getItem('auth_jwt_token')).to.equal('fake_jwt_token');
                expect(win.localStorage.getItem('auth_refresh_token')).to.equal('fake_refresh_token');
            });
        });

        /**
         * Simulates loading a protected page in mobile mode with a stored token.
         * Covers: AuthInterceptor mobile path, getAuthToken, getMobileToken
         */
        it('should attach Bearer token from localStorage to protected API requests', () => {
            cy.intercept('GET', '/api/students', req => {
                expect(req.headers['authorization']).to.equal('Bearer stored_bearer_token');
                req.reply({ statusCode: 200, body: [] });
            }).as('studentsWithBearer');

            cy.visit('/studentList', {
                onBeforeLoad: win => {
                    (win as any).Capacitor = {};
                    win.localStorage.setItem('auth_jwt_token', 'stored_bearer_token');
                    win.localStorage.setItem('authState', JSON.stringify({ isLoggedIn: true, user: MOCK_USER }));
                }
            });
            cy.wait('@studentsWithBearer');
            cy.url().should('include', '/studentList');
        });

        /**
         * Simulates an expired token on mobile: 401 on the first call → refresh with
         * the stored refresh token → retry the original request with the new token.
         * Covers: AuthInterceptor handle401Error mobile branch,
         *         UserService.refreshAccessToken mobile path,
         *         getAuthRefreshToken, getMobileRefreshToken,
         *         setAuthToken (with refreshed token), storeMobileToken (second call),
         *         getAuthToken (inside handle401Error retry)
         */
        it('should refresh mobile token automatically on 401 and retry the request', () => {
            // Register fallback FIRST (lower priority — matched second onwards)
            cy.intercept('GET', '/api/students', { statusCode: 200, body: [] }).as('studentsOk');
            // Register 401 LAST (higher priority because Cypress matches LIFO — fires once only)
            cy.intercept({ method: 'GET', url: '/api/students', times: 1 }, { statusCode: 401 }).as('expired401');

            cy.intercept('POST', '/api/refresh', req => {
                req.reply({
                    statusCode: 200,
                    headers: { 'Authorization': 'Bearer refreshed_jwt_token' },
                    body: { message: 'Token refreshed successfully' }
                });
            }).as('tokenRefresh');

            cy.visit('/studentList', {
                onBeforeLoad: win => {
                    (win as any).Capacitor = {};
                    win.localStorage.setItem('auth_jwt_token', 'expired_token');
                    win.localStorage.setItem('auth_refresh_token', 'valid_refresh_token');
                    win.localStorage.setItem('authState', JSON.stringify({ isLoggedIn: true, user: MOCK_USER }));
                }
            });

            cy.wait('@expired401');
            cy.wait('@tokenRefresh');
            cy.wait('@studentsOk');
            cy.url().should('include', '/studentList');
        });

        /**
         * Simulates logout in mobile mode.
         * Covers: clearAuthData with isMobile()=true, clearMobileStorage DEV_MODE path
         */
        it('should remove all tokens from localStorage on logout in mobile mode', () => {
            cy.intercept('GET', '/api/students', { statusCode: 200, body: [] }).as('students');
            cy.intercept('POST', '/api/logout', { statusCode: 200, body: {} }).as('logout');

            cy.visit('/studentList', {
                onBeforeLoad: win => {
                    (win as any).Capacitor = {};
                    win.localStorage.setItem('auth_jwt_token', 'token_to_clear');
                    win.localStorage.setItem('auth_refresh_token', 'refresh_to_clear');
                    win.localStorage.setItem('authState', JSON.stringify({ isLoggedIn: true, user: MOCK_USER }));
                }
            });
            cy.wait('@students');

            cy.get('.menu-toggle-btn').click();
            cy.contains('button', 'Logout').click();
            cy.wait('@logout');

            cy.window().should(win => {
                expect(win.localStorage.getItem('authState')).to.be.null;
                expect(win.localStorage.getItem('auth_jwt_token')).to.be.null;
                expect(win.localStorage.getItem('auth_refresh_token')).to.be.null;
            });
        });
    });
});
