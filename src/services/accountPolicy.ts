import { Role, User } from '../types/index.ts';

export interface ProvisionTarget {
  role: Role;
  studentClassId?: string;
  /** Present for reset operations so self-provisioning can be rejected here too. */
  userId?: string;
}

export interface PolicyResult {
  allowed: boolean;
  reason?: string;
}

export class AccountPolicyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AccountPolicyError';
  }
}

/**
 * Pure permission rule for account provisioning and password resets.
 * Enforced by the service itself - callers cannot bypass it by hiding UI.
 */
export function canProvisionAccount(
  actor: User,
  target: ProvisionTarget,
  teacherAssignedClassIds: string[] = [],
): PolicyResult {
  if (target.userId && target.userId === actor.id) {
    return { allowed: false, reason: 'You cannot provision or reset your own account.' };
  }

  if (actor.role === 'super_admin') {
    return { allowed: true };
  }

  if (actor.role === 'admin') {
    if (target.role === 'admin' || target.role === 'super_admin') {
      return { allowed: false, reason: 'Admins cannot provision admin or super_admin accounts.' };
    }
    return { allowed: true };
  }

  if (actor.role === 'teacher') {
    if (target.role !== 'student') {
      return { allowed: false, reason: 'Teachers can only provision student accounts.' };
    }
    if (!target.studentClassId || !teacherAssignedClassIds.includes(target.studentClassId)) {
      return { allowed: false, reason: 'That student is not in one of your assigned classes.' };
    }
    return { allowed: true };
  }

  return { allowed: false, reason: 'Your role cannot provision or reset accounts.' };
}
