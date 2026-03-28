import { Injectable } from '@angular/core';
import { HttpErrorResponse } from "@angular/common/http";
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { InfoMessage } from '../models/InfoMessage';

/**
 * Centralized error handling service
 * Provides consistent error processing across the application
 */
@Injectable({
    providedIn: 'root'
})
export class ErrorService {

    constructor(private router: Router, private userService: UserService) { }

    /**
     * Handles HTTP errors with appropriate user messages and actions
     * @param err HTTP error response from server
     * @param infoMessage Message object to update with error information
     */
    handleError(err: HttpErrorResponse, infoMessage: InfoMessage): void {
        console.error('HTTP error occurred:', {
            status: err.status,
            message: err.message,
            url: err.url
        });

        let message: string = 'An unexpected error occurred. Please try again.';

        if (err.error?.message) {
            message = err.error.message;
            console.log('Using server error message:', message);
        } else {
            switch (err.status) {
                case 0:
                    message = 'Unable to connect to the server. Please check your network.';
                    console.warn('Network connectivity issue detected');
                    break;
                case 401:
                    message = 'Unauthorized. Please log in again.';
                    console.warn('Authentication required, redirecting to login');
                    this.userService.logout();
                    this.router.navigate(['/login'], { queryParams: { msg: message, error: true } });
                    break;
                case 403:
                    message = 'Access denied.';
                    console.warn('Access forbidden for current user');
                    break;
                case 404:
                    message = 'Service not found.';
                    console.warn('Requested resource not found:', err.url);
                    break;
                case 500:
                    message = 'Internal server error. Please try again later.';
                    console.error('Server internal error detected');
                    break;
                default:
                    console.warn('Unhandled HTTP error status:', err.status);
                    break;
            }
        }

        infoMessage.message = message;
        infoMessage.error = true;
    }
}