import { UserDTO } from "../models/User";
import { AuthType } from "./AuthType";

/**
 * DTO - Server response after a successful login
 * Carries authType so the client knows whether to store tokens (mobile) or rely on cookies (web)
 */
export class LoginResponse {

    message: string;
    success: boolean;
    user: UserDTO;
    // only present when using mobile JWT flow
    authType?: typeof AuthType[keyof typeof AuthType];
    // only sent by the server when authType is HEADER
    refreshToken?: string;

    /** CONSTRUCTOR */
    /* LOGIN RESPONSE */
    constructor(
        success: boolean,
        message: string,
        user: UserDTO,
        authType?: typeof AuthType[keyof typeof AuthType],
        refreshToken?: string) {
        this.success = success;
        this.message = message;
        this.user = user;
        this.authType = authType;
        this.refreshToken = refreshToken;

    }
}