/**
 * Authentication type constants for hybrid authentication handling
 * Used to indicate whether cookie-based or JWT header-based authentication is used
 */
export const enum AuthType {
    COOKIE = "COOKIE",
    HEADER = "HEADER"
};