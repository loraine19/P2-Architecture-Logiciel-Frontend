import { Observable } from "rxjs";
import { Login } from "../../models/Login";
import { UserDTO } from "../../models/User";
import { LoginResponse } from "../../models/LoginResponse";
import { MessageResponse } from "../../models/MessageResponse";

/**
 * User service interface for authentication and user management
 * Defines contract for user-related operations
 */
export interface UserServiceInterface {
    register(user: UserDTO): Observable<Object>;
    login(login: Login): Observable<LoginResponse>;
    logout(): void;
    isLoggedIn(): boolean;
    refreshAccessToken(isMobile: boolean): Observable<MessageResponse | any>;
}