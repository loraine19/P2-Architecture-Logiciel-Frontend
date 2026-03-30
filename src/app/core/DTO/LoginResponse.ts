import { UserDTO } from "../models/User";
import { AuthType } from "./AuthType";

export class LoginResponse {

    message: string;
    success: boolean;
    user: UserDTO;
    authType?: typeof AuthType[keyof typeof AuthType];
    refreshToken?: string;

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