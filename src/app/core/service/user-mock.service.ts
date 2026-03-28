import { UserDTO } from '../models/Register';
import { Observable, of } from 'rxjs';

/**
 * Mock user service for testing purposes
 * Provides stub implementations for user operations  
 */
export class UserMockService {

  /**
   * Mock user registration that always succeeds
   */
  register(user: UserDTO): Observable<Object> {
    console.log('Mock registration for user:', user.login);
    return of({ success: true, message: 'Mock registration successful' });
  }
}
