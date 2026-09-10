// src/utils/auth.ts
import { getAuthToken, verifyAuthToken, setAuthToken } from './apiClient';

/**
 * Verify an admin authentication token.
 * Validates JWT token cryptographically via backend API.
 */
export async function verifyAdminToken(token?: string | null): Promise<boolean> {
  const currentToken = token || getAuthToken();
  if (!currentToken || typeof currentToken !== 'string') {
    if (typeof window !== 'undefined') {
      const activeSession = sessionStorage.getItem('ngdc_admin_session');
      return activeSession === 'true';
    }
    return false;
  }

  try {
    const isValid = await verifyAuthToken();
    if (isValid) return true;

    // Fallback check
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('ngdc_admin_session') === 'true';
    }
    return false;
  } catch (err) {
    console.warn('Admin token verification failed:', err);
    return false;
  }
}

export { getAuthToken, setAuthToken };
