import { Injectable } from '@angular/core';
import { HttpErrorResponse } from "@angular/common/http";
import { InfoMessage } from '../DTO/InfoMessage';

/**
 * Centralized error handling service
 * Transforms HTTP errors into user-friendly UI messages
 */
type ErrorServiceInterface = {
    handleError(err: HttpErrorResponse, infoMessage: InfoMessage): void;
}

@Injectable({
    providedIn: 'root'
})
export class ErrorService implements ErrorServiceInterface {

    /** PUBLIC METHODS */

    /* HANDLE ERROR */
    handleError(err: HttpErrorResponse, infoMessage: InfoMessage): void {
        const message = this.getErrorMessage(err);

        infoMessage.message = message;
        infoMessage.error = true;
    }

    /** PRIVATE METHODS */

    /* GET ERROR MESSAGE */
    private getErrorMessage(err: HttpErrorResponse): string {
        // Retourne le message formaté par le GlobalExceptionHandler de Spring Boot
        if (err.error?.message) {
            return err.error.message;
        }

        // Fallback en cas de crash réseau ou serveur injoignable
        switch (err.status) {
            case 0:
                return 'Unable to connect to the server. Please check your network.';
            case 401:
                return 'Unauthorized. Please log in again.';
            case 403:
                return 'Access denied.';
            case 404:
                return 'Service not found.';
            case 500:
                return 'Internal server error. Please try again later.';
            default:
                return 'An unexpected error occurred. Please try again.';
        }
    }
}