import { UserDTO } from '../models/User';
import { Observable, of } from 'rxjs';

/**
 * Mock service - Stub for UserService used in tests
 * Returns hardcoded Observables so components can be tested without HTTP calls
 */
export class UserMockService {

    /** PUBLIC */
    /* REGISTER */
    register(user: UserDTO): Observable<Object> {
        return of({ success: true, message: 'Mock registration successful' });
    }
}
