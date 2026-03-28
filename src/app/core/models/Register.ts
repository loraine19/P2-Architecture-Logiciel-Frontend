/**
 * User entity model with complete user information
 * Includes timestamps for audit tracking
 */
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  login: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User DTO for registration without generated fields
 * Used when creating new user accounts
 */
export type UserDTO = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
