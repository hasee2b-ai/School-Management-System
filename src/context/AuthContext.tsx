import React, { createContext, useContext, useState, useEffect } from 'react';
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(AUTH_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read saved auth user', e);
    }
    // Default to Super Admin for initial experience
    return INITIAL_USERS[0];
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  useEffect(() => {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser));
  }, [currentUser]);

  const switchRole = (role: Role) => {
    const targetUser = INITIAL_USERS.find((u) => u.role === role) || {
      id: `usr_${role}`,
      name: `${role.replace('_', ' ').toUpperCase()} User`,
      email: `${role}@staugustine.edu`,
      role,
    };
    setCurrentUser(targetUser);
    setIsAuthenticated(true);
  };

  const loginAs = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
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
