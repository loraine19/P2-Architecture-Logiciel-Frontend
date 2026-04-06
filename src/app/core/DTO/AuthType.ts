/**
 * DTO - Authentication type constants for hybrid authentication
 * Distinguishes cookie-based (web) from JWT header-based (mobile) auth strategy
 */
/** ENUM */
/* AUTH TYPE */
export const enum AuthType {
    // web browsers use HttpOnly cookies set and managed by the server
    COOKIE = "COOKIE",
    // native mobile apps send JWT in Authorization header
    HEADER = "HEADER"
};