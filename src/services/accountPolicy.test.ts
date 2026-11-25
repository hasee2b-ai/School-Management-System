import { describe, expect, it } from 'vitest';
import { INITIAL_USERS } from '../data/mockData.ts';
import { Role, User } from '../types/index.ts';
import { AccountPolicyError, canProvisionAccount } from './accountPolicy.ts';

const ROLES: Role[] = [
  'super_admin', 'admin', 'principal', 'teacher', 'student', 'parent',
  'accountant', 'librarian', 'transport_manager',
];
const ASSIGNED_CLASSES = ['cls_10'];
const actorFor = (role: Role): User => INITIAL_USERS.find((user) => user.role === role)!;

function expectedForMatrix(actorRole: Role, targetRole: Role): boolean {
  if (actorRole === 'super_admin') return true;
  if (actorRole === 'admin') return targetRole !== 'admin' && targetRole !== 'super_admin';
  if (actorRole === 'teacher') return targetRole === 'student'; // class cls_10 is assigned
  return false;
}

describe('canProvisionAccount - full actor x target matrix', () => {
  for (const actorRole of ROLES) {
    for (const targetRole of ROLES) {
      it(`${actorRole} -> ${targetRole}`, () => {
        const result = canProvisionAccount(
          actorFor(actorRole),
          { role: targetRole, studentClassId: 'cls_10' },
          ASSIGNED_CLASSES,
        );
        expect(result.allowed).toBe(expectedForMatrix(actorRole, targetRole));
        if (!result.allowed) expect(result.reason).toBeTruthy();
      });
    }
  }
});

describe('canProvisionAccount - teacher class scope', () => {
  const teacher = actorFor('teacher');

  it('allows a student in an assigned class', () => {
    expect(canProvisionAccount(
      teacher, { role: 'student', studentClassId: 'cls_10' }, ASSIGNED_CLASSES,
    ).allowed).toBe(true);
  });

  it('denies a student in another class', () => {
    const result = canProvisionAccount(
      teacher, { role: 'student', studentClassId: 'cls_11' }, ASSIGNED_CLASSES,
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/assigned classes/);
  });

  it('denies a student with no class, and any non-student target', () => {
    expect(canProvisionAccount(teacher, { role: 'student' }, ASSIGNED_CLASSES).allowed).toBe(false);
    for (const targetRole of ROLES.filter((role) => role !== 'student')) {
      expect(canProvisionAccount(
        teacher, { role: targetRole, studentClassId: 'cls_10' }, ASSIGNED_CLASSES,
      ).allowed).toBe(false);
    }
  });

  it('denies when the teacher has no matching record / no assigned classes', () => {
    expect(canProvisionAccount(teacher, { role: 'student', studentClassId: 'cls_10' }, []).allowed).toBe(false);
  });
});

describe('canProvisionAccount - admin / super_admin and self rules', () => {
  it('admin cannot create admin or super_admin, but can create other roles', () => {
    const admin = actorFor('admin');
    expect(canProvisionAccount(admin, { role: 'admin' }).allowed).toBe(false);
    expect(canProvisionAccount(admin, { role: 'super_admin' }).allowed).toBe(false);
    expect(canProvisionAccount(admin, { role: 'teacher' }).allowed).toBe(true);
    expect(canProvisionAccount(admin, { role: 'student', studentClassId: 'cls_99' }).allowed).toBe(true);
  });

  it('super_admin can create every role', () => {
    const superAdmin = actorFor('super_admin');
    for (const role of ROLES) {
      expect(canProvisionAccount(superAdmin, { role }).allowed).toBe(true);
    }
  });

  it('nobody may provision or reset themselves', () => {
    for (const role of ROLES) {
      const actor = actorFor(role);
      const result = canProvisionAccount(
        actor,
        { role: 'student', studentClassId: 'cls_10', userId: actor.id },
        ASSIGNED_CLASSES,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toMatch(/your own account/);
    }
  });

  it('exports a typed AccountPolicyError', () => {
    const error = new AccountPolicyError('denied');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('AccountPolicyError');
    expect(error.message).toBe('denied');
  });
});
