/**
 * Information message model for user notifications
 * Used across components for success and error messages
 */
export interface InfoMessage {
    message: string;
    error: boolean;
}

/**
 * Factory methods for InfoMessage creation
 */
export class InfoMessageFactory {
    /**
     * Creates success message
     */
    static success(message: string): InfoMessage {
        return { message, error: false };
    }

    /**
     * Creates error message
     */
    static error(message: string): InfoMessage {
        return { message, error: true };
    }

    /**
     * Creates empty message
     */
    static empty(): InfoMessage {
        return { message: '', error: false };
    }
}