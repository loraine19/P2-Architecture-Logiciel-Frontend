import { Observable } from "rxjs";
import { Auth } from "../../models/Auth";
import { Login } from "../../models/Login";
import { UserDTO } from "../../models/Register";

/**
 * User service interface for authentication and user management
 * Defines contract for user-related operations
 */
export interface UserServiceInterface {
    /**
     * Registers a new user account
     */
    register(user: UserDTO): Observable<Object>;

    /**
     * Authenticates user with login credentials
     */
    login(login: Login): Observable<Auth>;

    /**
     * Logs out current user and clears session
     */
    logout(): void;

    /**
     * Checks if user is currently logged in
     */
    isLoggedIn(): boolean;
}