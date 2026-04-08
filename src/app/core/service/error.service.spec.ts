import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from './error.service';
import { InfoMessage } from '../constants/InfoMessage';
import { HttpErrorMessage } from '../constants/httpErrorMessage';

/**
 * Unit tests for ErrorService — HTTP error handling and message mapping
 * No TestBed needed — ErrorService has no injected dependencies, it is instantiated directly
 */

describe('ErrorService', () => {
    let service: ErrorService;

    /** TEST SETUP */
    /* beforeEach */
    // creates a new instance directly — no TestBed needed since ErrorService has no injected dependencies
    beforeEach(() => {
        service = new ErrorService();
    });

    /** SERVICE TESTS */
    /* SERVICE INITIALIZATION */
    describe('Service Initialization', () => {
        it('should be created', () => {
            expect(service).toBeTruthy();
        });
    });

    /* HANDLE ERROR */
    describe('handleError()', () => {
        // helper that builds a fake HttpErrorResponse with a given status and optional error body
        const makeError = (status: number, errorBody?: any) =>
            new HttpErrorResponse({ status, error: errorBody, url: '/api/test' });

        // server-provided message always takes priority over the status-based fallback
        it('should use the server error message when provided', () => {
            const info: InfoMessage = { message: '', error: false };
            service.handleError(makeError(400, { message: 'Custom server message' }), info);
            expect(info.message).toBe('Custom server message');
            expect(info.error).toBe(true);
        });

        it('should return network error message for status 0', () => {
            const info: InfoMessage = { message: '', error: false };
            service.handleError(makeError(0), info);
            expect(info.message).toBe(HttpErrorMessage.NETWORK);
            expect(info.error).toBe(true);
        });

        it('should return unauthorized message for 401', () => {
            const info: InfoMessage = { message: '', error: false };
            service.handleError(makeError(401), info);
            expect(info.message).toBe(HttpErrorMessage.UNAUTHORIZED);
            expect(info.error).toBe(true);
        });

        it('should return access denied message for 403', () => {
            const info: InfoMessage = { message: '', error: false };
            service.handleError(makeError(403), info);
            expect(info.message).toBe(HttpErrorMessage.FORBIDDEN);
            expect(info.error).toBe(true);
        });

        it('should return not found message for 404', () => {
            const info: InfoMessage = { message: '', error: false };
            service.handleError(makeError(404), info);
            expect(info.message).toBe(HttpErrorMessage.NOT_FOUND);
            expect(info.error).toBe(true);
        });

        it('should return server error message for 500', () => {
            const info: InfoMessage = { message: '', error: false };
            service.handleError(makeError(500), info);
            expect(info.message).toBe(HttpErrorMessage.SERVER_ERROR);
            expect(info.error).toBe(true);
        });

        it('should return generic message for unknown status codes', () => {
            const info: InfoMessage = { message: '', error: false };
            service.handleError(makeError(418), info);
            expect(info.message).toBe(HttpErrorMessage.UNKNOWN);
            expect(info.error).toBe(true);
        });

        // error flag must always be true regardless of which branch was taken
        it('should always set error flag to true', () => {
            const info: InfoMessage = { message: 'previous', error: false };
            service.handleError(makeError(401), info);
            expect(info.error).toBe(true);
        });
    });
});
