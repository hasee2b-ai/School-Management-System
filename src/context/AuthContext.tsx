import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Role } from '../types/index.ts';
import { StorageService } from '../services/storage.ts';
import { getMustChangePassword, seedAccountsIfMissing, verifyLogin } from '../services/authService.ts';

interface AuthContextType {
  currentUser: User; // effective user (the view-as user when viewing as)
  currentRole: Role; // effective role
  actualUser: User; // the real signed-in user
  isViewingAs: boolean;
  viewAsRole: Role | null;
  viewAs: (role: Role) => boolean;
  exitViewAs: () => void;
  availableUsers: User[];
  loginAs: (user: User) => void; // demo tiles only; no-op when demo mode is off
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  mustChangePassword: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'smc_auth_user';
const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

interface SavedSession {
  id: string;
  loginAt: number;
}

/** Single permission rule shared by the guard and the view-as UI. */
export function canViewAsRole(actualRole: Role, targetRole: Role): boolean {
  if (actualRole === 'super_admin') return targetRole !== 'super_admin';
  if (actualRole === 'admin') return targetRole !== 'super_admin' && targetRole !== 'admin';
  return false;
}

function readSavedSession(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedSession> | null;
    if (!parsed || typeof parsed.id !== 'string') return null;
    if (typeof parsed.loginAt !== 'number' || !Number.isFinite(parsed.loginAt)) return null;
    const age = Date.now() - parsed.loginAt;
    if (age > SESSION_MAX_AGE_MS || age < 0) return null;
    // Restore the canonical user; never trust fields from storage.
    return StorageService.getUsers().find((user) => user.id === parsed.id) ?? null;
  } catch {
    return null;
  }
}

function persistSession(user: User): void {
  try {
    const session: SavedSession = { id: user.id, loginAt: Date.now() };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(session));
  } catch (e) {
    console.warn('Could not save session', e);
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState(() => {
    const user = readSavedSession();
    return { user, isAuthenticated: user !== null };
  });
  const [viewAsRole, setViewAsRole] = useState<Role | null>(null);

  // Seed accounts once when the provider mounts.
  useEffect(() => {
    void seedAccountsIfMissing();
  }, []);

  const users = StorageService.getUsers();
  const actualUser = session.user ?? users[0]; // placeholder while logged out
  const effectiveUser = viewAsRole
    ? users.find((user) => user.role === viewAsRole) ?? actualUser
    : actualUser;
  const { isAuthenticated } = session;
  const isViewingAs = viewAsRole !== null && isAuthenticated;

  const startSession = (user: User) => {
    persistSession(user);
    setSession({ user, isAuthenticated: true });
    setViewAsRole(null);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const user = await verifyLogin(email, password);
    if (!user) return false;
    startSession(user);
    return true;
  };

  const loginAs = (user: User) => {
    if (!DEMO_MODE) return;
    startSession(user);
  };

  const viewAs = (role: Role): boolean => {
    if (!isAuthenticated || !canViewAsRole(actualUser.role, role)) return false;
    if (!StorageService.getUsers().some((user) => user.role === role)) return false;
    setViewAsRole(role);
    return true;
  };

  const exitViewAs = () => {
    setViewAsRole(null);
  };

  const logout = () => {
    try {
      localStorage.removeItem(AUTH_USER_KEY);
    } catch (e) {
      console.warn('Could not clear session', e);
    }
    setSession({ user: null, isAuthenticated: false });
    setViewAsRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser: effectiveUser,
        currentRole: effectiveUser.role,
        actualUser,
        isViewingAs,
        viewAsRole: isViewingAs ? viewAsRole : null,
        viewAs,
        exitViewAs,
        availableUsers: users,
        loginAs,
        login,
        logout,
        isAuthenticated,
        mustChangePassword: isAuthenticated && getMustChangePassword(actualUser.id),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
