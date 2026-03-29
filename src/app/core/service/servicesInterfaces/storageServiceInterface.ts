import { LoginResponse } from "../../models/LoginResponse";
import { UserDTO } from "../../models/User";

export interface StorageServiceInterface {
    getAuthToken(): Promise<string | null>;
    setAuthToken(token: string): Promise<void>;
    getAuthRefreshToken(): Promise<string | null>;
    setAuthRefreshToken(token: string): Promise<void>;
    setAuthState(loginResponse: LoginResponse): void;
    getAuthState(): boolean;
    getAuthStateUser(): UserDTO | null;
    clearAuthData(): Promise<void>;
}