import { Injectable } from '@angular/core';
import { HttpErrorResponse } from "@angular/common/http";
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { InfoMessage } from '../models/InfoMessage';
import { PlatformDetectionService } from './platform-detection.service';

/**
 * Centralized error handling service
 */
type ErrorServiceInterface = {
    handleError(err: HttpErrorResponse, infoMessage: InfoMessage): void;
}

@Injectable({
    providedIn: 'root'
})

export class ErrorService implements ErrorServiceInterface {

    constructor(
        private router: Router,
        private userService: UserService,
        private platformDetection: PlatformDetectionService) { }

    handleError(err: HttpErrorResponse, infoMessage: InfoMessage): void {
        let message = this.getErrorMessage(err);

        if (err.status === 401 && this.platformDetection.isMobile()) {
            this.userService.refreshAccessToken().subscribe(
                (response) => {
                    if (!response) {
                        this.userService.logout();
                        this.router.navigate(['/login'], { queryParams: { msg: 'Your session has expired. Please log in again.', error: true } });
                    }
                    else {
                        location.reload();
                    }
                }
            );
        }


        infoMessage.message = message;
        infoMessage.error = true;
    }

    private getErrorMessage(err: HttpErrorResponse): string {
        if (err.error?.message) {
            return err.error.message;
        }

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