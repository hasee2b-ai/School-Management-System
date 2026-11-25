import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { webcrypto } from 'node:crypto';
import { TextEncoder as NodeTextEncoder } from 'node:util';
import { INITIAL_USERS } from '../data/mockData.ts';
import { Role, User } from '../types/index.ts';
import { StorageService } from './storage.ts';
import { AccountPolicyError } from './accountPolicy.ts';
import {
  AuditEntry,
  DEMO_PASSWORD,
  changePassword,
  findAccountByEmail,
  getLockRemainingMs,
  getMustChangePassword,
  provisionAccount,
  resetPassword,
  seedAccountsIfMissing,
  verifyLogin,
} from './authService.ts';

// Node 25 exposes a non-functional global localStorage stub; provide a real in-memory one.
class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, String(value)); }
}

beforeAll(() => {
  Object.defineProperty(globalThis, 'localStorage', { value: new MemoryStorage(), configurable: true });
  // jsdom does not expose WebCrypto subtle / getRandomValues.
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
  if (typeof globalThis.TextEncoder === 'undefined') {
    Object.defineProperty(globalThis, 'TextEncoder', { value: NodeTextEncoder, configurable: true });
  }
});

beforeEach(() => {
  localStorage.clear();
});

function allStoredText(): string {
  const parts: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key) parts.push(localStorage.getItem(key) ?? '');
  }
  return parts.join('|');
}

const ROLES: Role[] = [
  'super_admin', 'admin', 'principal', 'teacher', 'student', 'parent',
  'accountant', 'librarian', 'transport_manager',
];
const actorFor = (role: Role): User => INITIAL_USERS.find((user) => user.role === role)!;
const superAdmin = actorFor('super_admin');
const teacher = actorFor('teacher'); // tch_01, assigned cls_10 + cls_12
let sequence = 0;
const uniqueEmail = (prefix = 'newuser') => {
  sequence += 1;
  return `${prefix}${sequence}.test@example.com`;
};

describe('email validation and provisioning', () => {
  it('trims and lowercases emails, rejects invalid and duplicate addresses', async () => {
    await seedAccountsIfMissing();
    const email = uniqueEmail('Mixed');
    const result = await provisionAccount(superAdmin, {
      name: '  Jordan New  ',
      email: `  ${email.toUpperCase()}  `,
      role: 'teacher',
    });
    expect(result.user.email).toBe(email.toLowerCase());
    expect(result.user.name).toBe('Jordan New');
    expect(result.user.role).toBe('teacher');

    await expect(provisionAccount(superAdmin, {
      name: 'Duplicate', email: ` ${email} `, role: 'student',
    })).rejects.toThrow(AccountPolicyError);
    await expect(provisionAccount(superAdmin, {
      name: 'Invalid', email: 'not-an-email', role: 'student',
    })).rejects.toThrow(AccountPolicyError);
  });

  it('rejects duplicate seeded emails regardless of case and spacing', async () => {
    await seedAccountsIfMissing();
    await expect(provisionAccount(superAdmin, {
      name: 'Clone', email: '  ALEXANDER.CROSS@STAUGUSTINE.EDU ', role: 'student',
    })).rejects.toThrow(AccountPolicyError);
  });
});

describe('temporary passwords and account storage', () => {
  it('generates distinct 12-char passwords with no look-alikes and stores only hashes', async () => {
    await seedAccountsIfMissing();
    const first = await provisionAccount(superAdmin, { name: 'One', email: uniqueEmail(), role: 'student' });
    const second = await provisionAccount(superAdmin, { name: 'Two', email: uniqueEmail(), role: 'student' });

    for (const password of [first.temporaryPassword, second.temporaryPassword]) {
      expect(password).toHaveLength(12);
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[0-9]/);
      expect(password).not.toMatch(/[0Oo1lI]/);
    }
    expect(first.temporaryPassword).not.toBe(second.temporaryPassword);

    const account = findAccountByEmail(first.user.email)!;
    expect(account.salt).toMatch(/^[0-9a-f]{32}$/);
    expect(account.passwordHash).toMatch(/^[0-9a-f]{64}$/);
    expect(account.mustChangePassword).toBe(true);

    const persisted = allStoredText();
    expect(persisted).not.toContain(first.temporaryPassword);
    expect(persisted).not.toContain(second.temporaryPassword);
    expect(persisted).not.toContain(DEMO_PASSWORD);
  });

  it('adds provisioned users to smc_data_users and re-seeds corrupt user data', async () => {
    await seedAccountsIfMissing();
    const result = await provisionAccount(superAdmin, { name: 'Dynamic', email: uniqueEmail(), role: 'student' });
    const users = JSON.parse(localStorage.getItem('smc_data_users') ?? '[]') as User[];
    expect(users.some((user) => user.id === result.user.id && user.email === result.user.email)).toBe(true);

    localStorage.setItem('smc_data_users', '{not json');
    expect(StorageService.getUsers()).toHaveLength(INITIAL_USERS.length);
  });
});

describe('policy enforcement inside the service', () => {
  it('denies forbidden actors and roles, allows a teacher within assigned classes', async () => {
    await seedAccountsIfMissing();
    await expect(provisionAccount(actorFor('student'), {
      name: 'Nope', email: uniqueEmail(), role: 'teacher',
    })).rejects.toThrow(AccountPolicyError);
    await expect(provisionAccount(actorFor('admin'), {
      name: 'Nope', email: uniqueEmail(), role: 'admin',
    })).rejects.toThrow(AccountPolicyError);
    await expect(provisionAccount(teacher, {
      name: 'Nope', email: uniqueEmail(), role: 'student', studentClassId: 'cls_11',
    })).rejects.toThrow(AccountPolicyError);

    const allowed = await provisionAccount(teacher, {
      name: 'Assigned Student', email: uniqueEmail(), role: 'student', studentClassId: 'cls_10',
    });
    expect(allowed.user.role).toBe('student');
  });

  it('enforces the same policy on resetPassword', async () => {
    await seedAccountsIfMissing();
    await expect(resetPassword(teacher, actorFor('admin').id)).rejects.toThrow(AccountPolicyError);
    await expect(resetPassword(actorFor('parent'), actorFor('student').id)).rejects.toThrow(AccountPolicyError);
    await expect(resetPassword(superAdmin, superAdmin.id)).rejects.toThrow(AccountPolicyError);

    const created = await provisionAccount(teacher, {
      name: 'Reset Me', email: uniqueEmail(), role: 'student',
      associatedId: 'stu_01', studentClassId: 'cls_10',
    });
    const reset = await resetPassword(teacher, created.user.id);
    expect(reset.temporaryPassword).not.toBe(created.temporaryPassword);
  });
});

describe('resetPassword', () => {
  it('invalidates the old password, enables the new one and flags mustChangePassword', async () => {
    await seedAccountsIfMissing();
    const created = await provisionAccount(superAdmin, {
      name: 'Resettable', email: uniqueEmail(), role: 'student',
    });
    expect(await verifyLogin(created.user.email, created.temporaryPassword)).not.toBeNull();

    const reset = await resetPassword(superAdmin, created.user.id);
    expect(reset.temporaryPassword).not.toBe(created.temporaryPassword);
    expect(await verifyLogin(created.user.email, created.temporaryPassword)).toBeNull();
    expect(await verifyLogin(created.user.email, reset.temporaryPassword)).toMatchObject({
      id: created.user.id, role: 'student',
    });
    expect(getMustChangePassword(created.user.id)).toBe(true);
  });
});

describe('changePassword', () => {
  it('rejects bad current password and weak/new-equal passwords, then succeeds', async () => {
    await seedAccountsIfMissing();
    const created = await provisionAccount(superAdmin, {
      name: 'Changer', email: uniqueEmail(), role: 'student',
    });
    const current = created.temporaryPassword;

    await expect(changePassword(created.user.id, 'WrongCurrent1', 'BrandNew123'))
      .rejects.toThrow(/Current password is incorrect/);
    await expect(changePassword(created.user.id, current, 'Ab1'))
      .rejects.toThrow(/at least 8 characters/);
    await expect(changePassword(created.user.id, current, 'abcdefgh'))
      .rejects.toThrow(/letter and a digit/);
    await expect(changePassword(created.user.id, current, current))
      .rejects.toThrow(/differ from the current password/);

    await changePassword(created.user.id, current, 'BrandNew123');
    expect(getMustChangePassword(created.user.id)).toBe(false);
    expect(await verifyLogin(created.user.email, 'BrandNew123')).not.toBeNull();
    expect(await verifyLogin(created.user.email, current)).toBeNull();
  });
});

describe('audit log', () => {
  it('records provision / reset / change without any password material', async () => {
    await seedAccountsIfMissing();
    const created = await provisionAccount(superAdmin, {
      name: 'Audited', email: uniqueEmail(), role: 'student',
    });
    const reset = await resetPassword(superAdmin, created.user.id);
    await changePassword(created.user.id, reset.temporaryPassword, 'AuditPass123');

    const log = JSON.parse(localStorage.getItem('smc_audit_log') ?? '[]') as AuditEntry[];
    expect(log.map((entry) => entry.action)).toEqual(['provision', 'reset_password', 'change_password']);
    expect(log.every((entry) => Boolean(entry.at && entry.actorId && entry.targetUserId && entry.targetRole))).toBe(true);
    expect(log.map((entry) => entry.targetRole)).toEqual(['student', 'student', 'student']);

    const text = JSON.stringify(log);
    expect(text).not.toContain(created.temporaryPassword);
    expect(text).not.toContain(reset.temporaryPassword);
    expect(text).not.toContain('AuditPass123');
    expect(text).not.toContain(DEMO_PASSWORD);
  });
});

describe('login and throttling after provisioning', () => {
  it('logs in with the temp password and locks after five wrong attempts', async () => {
    await seedAccountsIfMissing();
    const created = await provisionAccount(superAdmin, {
      name: 'Throttled', email: uniqueEmail(), role: 'student',
    });
    expect(await verifyLogin(created.user.email, created.temporaryPassword)).not.toBeNull();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect(await verifyLogin(created.user.email, 'definitely-wrong')).toBeNull();
    }
    expect(getLockRemainingMs(created.user.email)).toBeGreaterThan(0);
    expect(await verifyLogin(created.user.email, created.temporaryPassword)).toBeNull();
  });
});

describe('seeded access', () => {
  it('seeds one account per user and all seeded roles exist', async () => {
    await seedAccountsIfMissing();
    const accounts = JSON.parse(localStorage.getItem('smc_accounts') ?? '[]');
    expect(accounts).toHaveLength(ROLES.length);
    for (const role of ROLES) {
      expect(actorFor(role)).toBeTruthy();
    }
  });
});
