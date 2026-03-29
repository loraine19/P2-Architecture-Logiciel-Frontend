/**
 * Message response entity for API responses
 * Contains status messages and response info
 * Used across controllers for consistent messaging
 */
export interface MessageResponse {
  // Response message - informative text for client
  message: string;
}

/**
 * MessageResponse utility class with factory methods
 */
export class MessageResponseBuilder {
  
  /**
   * Create a success message response
   */
  static success(message: string): MessageResponse {
    if (!message || message.trim().length === 0) {
      throw new Error('Message is required');
    }
    
    if (message.length > 500) {
      throw new Error('Message must not exceed 500 characters');
    }

    return { message };
  }

  /**
   * Create an error message response
   */
  static error(message: string): MessageResponse {
    if (!message || message.trim().length === 0) {
      throw new Error('Message is required');
    }
    
    if (message.length > 500) {
      throw new Error('Message must not exceed 500 characters');
    }

    return { message };
  }

  /**
   * Validate message response object
   */
  static validate(messageResponse: MessageResponse): boolean {
    if (!messageResponse) {
      return false;
    }

    const { message } = messageResponse;
    
    // Check if message is not blank
    if (!message || message.trim().length === 0) {
      return false;
    }

    // Check size constraint
    if (message.length > 500) {
      return false;
    }

    return true;
  }
}
