import { LoginResponse } from "../../DTO/LoginResponse";
import { UserDTO } from "../../models/User";

/**
 * Interface - Contract for platform-aware token storage
 * Implementations must support both mobile (native secure storage) and web (cookie-based)
 */
/** INTERFACE */
/* STORAGE SERVICE INTERFACE */
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