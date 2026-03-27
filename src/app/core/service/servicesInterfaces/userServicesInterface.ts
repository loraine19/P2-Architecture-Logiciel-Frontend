import { Observable } from "rxjs";
import { Auth } from "../../models/Auth";
import { Login } from "../../models/Login";
import { UserDTO } from "../../models/Register";

export interface UserServiceInterface {
    register(user: UserDTO): Observable<Object>;
    login(login: Login): Observable<Auth>;
    logout(): void;
    isLoggedIn(): boolean;
}