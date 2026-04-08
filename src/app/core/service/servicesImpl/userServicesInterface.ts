import { Observable } from "rxjs";
import { Login } from "../../DTO/Login";
import { UserDTO } from "../../models/User";
import { LoginResponse } from "../../DTO/LoginResponse";
import { MessageResponse } from "../../DTO/MessageResponse";

/**
 * Interface - Contract for user authentication and session management
 * Defines all user-related operations that any implementation must provide
 */
/** INTERFACE */
/* USER SERVICE INTERFACE */
export interface UserServiceInterface {
    register(user: UserDTO): Observable<Object>;
    login(login: Login): Observable<LoginResponse>;
    logout(): void;
    isLoggedIn(): boolean;
    refreshAccessToken(isMobile: boolean): Observable<MessageResponse | any>;
}