import { UserDTO } from '../models/User';
import { Observable, of } from 'rxjs';

/**
 * Mock user service for testing
 */
export class UserMockService {

    register(user: UserDTO): Observable<Object> {
        return of({ success: true, message: 'Mock registration successful' });
    }
}
