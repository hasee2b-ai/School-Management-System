import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { Role } from '../../types/index.ts';
import { AccessDenied } from './AccessDenied.tsx';

interface RequireRoleProps {
  allowedRoles: Role[];
  children?: React.ReactNode;
}

export const RequireRole: React.FC<RequireRoleProps> = ({ allowedRoles, children }) => {
  const { currentUser } = useAuth();

  // Render in place (no redirect) so a denied role can never bounce between routes.
  if (!allowedRoles.includes(currentUser.role)) {
    return <AccessDenied role={currentUser.role} />;
  }

  return <>{children ?? <Outlet />}</>;
};
