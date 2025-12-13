/**
 * Authentication configuration
 */

// The base URL of the application - used for password reset redirects
// In production, this should be set to the actual domain
export const APP_URL = import.meta.env.VITE_APP_URL || 'https://wishlist.goodandfine.com';

// Password reset redirect URL
export const PASSWORD_RESET_REDIRECT_URL = `${APP_URL}/reset-password`;
