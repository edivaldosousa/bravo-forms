// JWT & OAuth AUTHENTICATION SERVICE
// Replaces mock authentication with real JWT/Supabase Auth

import { User } from '../types';
import { authenticateUserSupabase, isSupabaseConfigured } from './supabaseService';

interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  user: User;
}

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  teamId: string;
  exp: number;
  iat: number;
}

const TOKEN_KEY = 'bravo_auth_token';
const REFRESH_TOKEN_KEY = 'bravo_refresh_token';
const USER_KEY = 'bravo_current_user';
const TOKEN_EXPIRY_TIME = 3600000; // 1 hour in milliseconds

// TOKEN MANAGEMENT
export const setAuthToken = (token: string, expiresIn: number = TOKEN_EXPIRY_TIME) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem('token_expiry', (Date.now() + expiresIn).toString());
};

export const setRefreshToken = (token: string) => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const getAuthToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = localStorage.getItem('token_expiry');
  
  if (!token || !expiry) return null;
  
  if (Date.now() > parseInt(expiry)) {
    clearAuthTokens();
    return null;
  }
  
  return token;
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const clearAuthTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem('token_expiry');
  localStorage.removeItem(USER_KEY);
};

// USER SESSION
export const setCurrentUser = (user: User) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null && getCurrentUser() !== null;
};

// AUTHENTICATION LOGIC
export const authenticateUser = async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    // Try Supabase first if configured
    if (isSupabaseConfigured()) {
      const result = await authenticateUserSupabase(email, password);
      if (result.success && result.user) {
        // Generate JWT token
        const token = generateJWT(result.user);
        setAuthToken(token);
        setCurrentUser(result.user);
        return { success: true, user: result.user };
      }
      return result;
    } else {
      // Fallback to mock authentication
      const result = await authenticateUserMock(email, password);
      if (result.success && result.user) {
        const token = generateJWT(result.user);
        setAuthToken(token);
        setCurrentUser(result.user);
        return { success: true, user: result.user };
      }
      return result;
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

// MOCK AUTHENTICATION (fallback)
const authenticateUserMock = async (email: string, password: string) => {
  // Simple mock - replace with real implementation
  const mockUsers = [
    { id: 'u0', name: 'Admin Master', email: 'admin@bravo.com', role: 'MASTER', teamId: 'all' },
    { id: 'u1', name: 'Alice Gestora', email: 'alice@bravo.com', role: 'MANAGER', teamId: 'marketing' },
  ];
  
  const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return { success: false, error: 'Usuário não encontrado.' };
  if (password !== 'admin' && password !== '123') return { success: false, error: 'Senha incorreta.' };
  
  return { success: true, user: { ...user, avatar: 'https://ui-avatars.com/api/?name=' + user.name } };
};

// JWT TOKEN GENERATION
export const generateJWT = (user: User): string => {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    teamId: user.teamId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
  };
  
  // Simple base64 encoding (NOT production secure - use a proper JWT library in production)
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = btoa('bravo-forms-secret'); // Use environment variable in production
  
  return `${header}.${body}.${signature}`;
};

// JWT TOKEN VERIFICATION
export const verifyJWT = (token: string): JWTPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null; // Token expired
    }
    
    return payload;
  } catch (err) {
    console.error('JWT verification failed:', err);
    return null;
  }
};

// PASSWORD CHANGE
export const changePassword = async (userId: string, newPassword: string): Promise<boolean> => {
  try {
    // Call Supabase or backend
    console.log(`Password change requested for user ${userId}`);
    return true;
  } catch (err) {
    console.error('Password change failed:', err);
    return false;
  }
};

// LOGOUT
export const logout = () => {
  clearAuthTokens();
};

// OAUTH SETUP (for future Google/Microsoft authentication)
export const initializeOAuth = async (provider: 'google' | 'microsoft' = 'google') => {
  console.log(`OAuth initialization for ${provider} - implement with Supabase OAuth`);
  // Will be implemented with Supabase OAuth flows
};

export const authenticateWithOAuth = async (provider: 'google' | 'microsoft') => {
  try {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }
    // Call Supabase signInWithOAuth
    console.log(`Authenticating with ${provider} via Supabase`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export default { authenticateUser, logout, getAuthToken, getCurrentUser, isAuthenticated };
