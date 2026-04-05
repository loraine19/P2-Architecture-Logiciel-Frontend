import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from './error.service';
import { InfoMessage } from '../DTO/InfoMessage';

describe('ErrorService', () => {
    let service: ErrorService;

    beforeEach(() => {
        service = new ErrorService();
    });

    describe('Service Initialization', () => {
        it('should be created', () => {
            expect(service).toBeTruthy();
        });
    });

    describe('handleError()', () => {
        const makeError = (status: number, errorBody?: any) =>
            new HttpErrorResponse({ status, error: errorBody, url: '/api/test' });

        it('should use the server error message when provided', () => {
            const info: InfoMessage = { message: '', error: false };
            service.handleError(makeError(400, { message: 'Custom server message' }), info);
            expect(info.message).toBe('Custom server message');
            expect(info.error).toBe(true);
        });

        it('should return network error message for status 0', () => {
            const info: InfoMessage = { message: '', error: false };
            service.handleError(makeError(0), info);
            expect(info.message).toBe('Unable to connect to the server. Please check your network.');
            expect(info.error).toBe(true);
        });

        it('should return unauthorized message for 401', () => {
            const info: InfoMessage = { message: '', error: false };
            service.handleError(makeError(401), info);
            expect(info.message).toBe('Unauthorized. Please log in again.');
            expect(info.error).toBe(true);
        });

        it('should return access denied message for 403', () => {
            const info: InfoMessage = { message: '', error: false };
            service.handleError(makeError(403), info);
            expect(info.message).toBe('Access denied.');
            expect(info.error).toBe(true);
        });

        it('should return not found message for 404', () => {
            const info: InfoMessage = { message: '', error: false };
            service.handleError(makeError(404), info);
            expect(info.message).toBe('Service not found.');
            expect(info.error).toBe(true);
        });

        it('should return server error message for 500', () => {
            const info: InfoMessage = { message: '', error: false };
            service.handleError(makeError(500), info);
            expect(info.message).toBe('Internal server error. Please try again later.');
            expect(info.error).toBe(true);
        });

        it('should return generic message for unknown status codes', () => {
            const info: InfoMessage = { message: '', error: false };
            service.handleError(makeError(418), info);
            expect(info.message).toBe('An unexpected error occurred. Please try again.');
            expect(info.error).toBe(true);
        });

        it('should always set error flag to true', () => {
            const info: InfoMessage = { message: 'previous', error: false };
            service.handleError(makeError(401), info);
            expect(info.error).toBe(true);
        });
    });
});
