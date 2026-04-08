import { Injectable } from '@angular/core';
import { HttpErrorResponse } from "@angular/common/http";
import { InfoMessage } from '../constants/InfoMessage';
import { HttpErrorMessage } from '../constants/httpErrorMessage';

/**
 * Service - Centralizes HTTP error handling
 * Converts HTTP status codes into user-friendly messages for the template
 */
type ErrorServiceInterface = {
    handleError(err: HttpErrorResponse, infoMessage: InfoMessage): void;
}

@Injectable({
    providedIn: 'root'
})
export class ErrorService implements ErrorServiceInterface {

    /** PUBLIC */
    /* HANDLE ERROR */
    handleError(err: HttpErrorResponse, infoMessage: InfoMessage): void {
        const message = this.getErrorMessage(err);

        infoMessage.message = message;
        infoMessage.error = true;
    }

    /** PRIVATE */
    /* GET ERROR MESSAGE */
    private getErrorMessage(err: HttpErrorResponse): string {
        if (err.error?.message) {
            return err.error.message;
        }

        switch (err.status) {
            case 0: return HttpErrorMessage.NETWORK;
            case 401: return HttpErrorMessage.UNAUTHORIZED;
            case 403: return HttpErrorMessage.FORBIDDEN;
            case 404: return HttpErrorMessage.NOT_FOUND;
            case 500: return HttpErrorMessage.SERVER_ERROR;
            default: return HttpErrorMessage.UNKNOWN;
        }
    }
}