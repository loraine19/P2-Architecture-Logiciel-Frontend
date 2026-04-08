/**
 * @file httpErrorMessage.ts
 * HTTP status error message constants — used by ErrorService and AuthInterceptor
 */

export enum HttpErrorMessage {
    /* NETWORK */
    NETWORK = 'Unable to connect to the server. Please check your network.',

    /* AUTH */
    UNAUTHORIZED = 'Unauthorized. Please log in again.',
    SESSION_EXPIRED = 'Session expired. Please log in again.',

    /* ACCESS */
    FORBIDDEN = 'Access denied.',
    NOT_FOUND = 'Service not found.',

    /* SERVER */
    SERVER_ERROR = 'Internal server error. Please try again later.',
    UNKNOWN = 'An unexpected error occurred. Please try again.'
}
