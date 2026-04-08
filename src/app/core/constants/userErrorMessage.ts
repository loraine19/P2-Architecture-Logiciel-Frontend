/**
 * @file UserErrorMessages.ts
 * Application domain error constants.
 */

export enum UserErrorMessage {
    /* AUTHENTICATION ERRORS */
    INVALID_CREDENTIALS = "Invalid email or password.",
    USER_NOT_FOUND = "No user found with this email.",
    ACCOUNT_LOCKED = "Account is temporarily locked.",

    /* VALIDATION ERRORS */
    MISSING_FIELDS = "Please fill in all required fields.",
    REFRESH_TOKEN_NOT_AVAILABLE = 'No refresh token available',

    /* STORAGE ERRORS */
    SECURE_STORAGE_FAILED = 'Secure storage failed'
}