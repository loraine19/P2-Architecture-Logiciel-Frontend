/**
 * @file appNotification.ts
 * Application notification and success message constants
 * Static messages use an enum; dynamic messages (with names) use helper functions
 */

/* STATIC NOTIFICATIONS */
export enum AppNotification {
    /* AUTH */
    REGISTRATION_SUCCESS = 'Registration successful! Please log in.',

    /* STUDENT */
    STUDENT_DELETED = 'Student deleted successfully'
}

/* DYNAMIC NOTIFICATIONS */
// functions are used when the message includes runtime values (user name, student name, etc.)
export const AppNotificationMessage = {
    /* AUTH */
    REGISTER_WELCOME: (login: string) =>
        `Hi, ${login}! You are now registered, you can now log in!`,

    /* STUDENT */
    STUDENT_CREATED: (firstName: string, lastName: string) =>
        `Student ${firstName} ${lastName} created successfully`,

    STUDENT_UPDATED: (firstName: string, lastName: string) =>
        `Student ${firstName} ${lastName} has been updated successfully`
};
