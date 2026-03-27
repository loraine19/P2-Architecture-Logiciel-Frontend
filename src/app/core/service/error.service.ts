import { Injectable } from '@angular/core';
import { HttpErrorResponse } from "@angular/common/http";
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class ErrorService {

    constructor(private router: Router) { }
    handleError(err: HttpErrorResponse, infoMessage: { message: string; error: boolean }): void {
        console.error('An error occurred:', err);
        let message: string = infoMessage.message ?? 'An unexpected error occurred. Please try again.';

        if (err.error?.message) {
            message = err.error.message;
        } else {
            switch (err.status) {
                case 0:
                    message = 'Unable to connect to the server. Please check your network.';
                    break;
                case 401:
                    message = 'Invalid credentials. Please check your login and password.';
                    break;
                case 403:
                    message = 'Access denied.';
                    break;
                case 404:
                    message = 'Service not found.';
                    break;
                case 500:
                    message = 'Internal server error. You can try again later.';
                    break;
            }
        }

        infoMessage.message = message;
        infoMessage.error = true;
    }
}