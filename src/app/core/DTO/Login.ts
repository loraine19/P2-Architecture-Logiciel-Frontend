import { AuthType } from './AuthType';

/**
 * Login credentials model for user authentication
 * Used by authentication service and login component
 */
export class Login {
  login: string = '';
  password: string = '';
  rememberMe: boolean = false;
  authType: AuthType = AuthType.COOKIE; // Default to cookie-based auth, can be overridden by platform detection
}
