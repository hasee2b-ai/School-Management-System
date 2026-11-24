import React, { createContext, useContext, useState } from 'react';
import { User, Role } from '../types/index.ts';
import { INITIAL_USERS } from '../data/mockData.ts';

interface AuthContextType {
  currentUser: User;
  currentRole: Role;
  switchRole: (role: Role) => void;
  availableUsers: User[];
  loginAs: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'smc_auth_user';

// A saved session is only valid if it parses and its id matches a canonical user.
function readSavedUser(): User | null {
  try {
    const saved = localStorage.getItem(AUTH_USER_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved) as { id?: unknown } | null;
    if (!parsed || typeof parsed.id !== 'string') return null;
    return INITIAL_USERS.find((u) => u.id === parsed.id) ?? null;
  } catch {
    return null;
  }
}

function persistUser(user: User): void {
  try {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.warn('Could not save auth user', e);
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Keep currentUser non-null (placeholder until login) and gate the UI with isAuthenticated.
  // This avoids touching every consumer that reads currentUser.name / .role / .id.
  const [session, setSession] = useState(() => {
    const saved = readSavedUser();
    return {
      user: saved ?? INITIAL_USERS[0],
      isAuthenticated: saved !== null,
    };
  });

  const { user: currentUser, isAuthenticated } = session;

  const switchRole = (role: Role) => {
    const targetUser = INITIAL_USERS.find((u) => u.role === role) || {
      id: `usr_${role}`,
      name: `${role.replace('_', ' ').toUpperCase()} User`,
      email: `${role}@staugustine.edu`,
      role,
    };
    persistUser(targetUser);
    setSession({ user: targetUser, isAuthenticated: true });
  };

  const loginAs = (user: User) => {
    persistUser(user);
    setSession({ user, isAuthenticated: true });
  };

  const logout = () => {
    try {
      localStorage.removeItem(AUTH_USER_KEY);
    } catch (e) {
      console.warn('Could not clear saved auth user', e);
    }
    setSession((prev) => ({ ...prev, isAuthenticated: false }));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser.role,
        switchRole,
        availableUsers: INITIAL_USERS,
        loginAs,
        logout,
        isAuthenticated,
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
