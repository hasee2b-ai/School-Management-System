import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
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
  findAccountByUserId,
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

afterEach(() => {
  vi.useRealTimers();
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
      name: 'Duplicate', email: ` ${email} `, role: 'teacher',
    })).rejects.toThrow(AccountPolicyError);
    await expect(provisionAccount(superAdmin, {
      name: 'Invalid', email: 'not-an-email', role: 'teacher',
    })).rejects.toThrow(AccountPolicyError);
  });

  it('rejects duplicate seeded emails regardless of case and spacing', async () => {
    await seedAccountsIfMissing();
    await expect(provisionAccount(superAdmin, {
      name: 'Clone', email: '  ALEXANDER.CROSS@STAUGUSTINE.EDU ', role: 'teacher',
    })).rejects.toThrow(AccountPolicyError);
  });
});

describe('temporary passwords and account storage', () => {
  it('generates distinct 12-char passwords with no look-alikes and stores only hashes', async () => {
    await seedAccountsIfMissing();
    const first = await provisionAccount(superAdmin, { name: 'One', email: uniqueEmail(), role: 'teacher' });
    const second = await provisionAccount(superAdmin, { name: 'Two', email: uniqueEmail(), role: 'teacher' });

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
    const result = await provisionAccount(superAdmin, { name: 'Dynamic', email: uniqueEmail(), role: 'teacher' });
    const users = JSON.parse(localStorage.getItem('smc_data_users') ?? '[]') as User[];
    expect(users.some((user) => user.id === result.user.id && user.email === result.user.email)).toBe(true);

    localStorage.setItem('smc_data_users', '{not json');
    expect(StorageService.getUsers()).toHaveLength(INITIAL_USERS.length);
  });
});

describe('student identity is derived from records, never from callers', () => {
  it('requires an associatedId that matches an existing student', async () => {
    await seedAccountsIfMissing();
    await expect(provisionAccount(superAdmin, {
      name: 'No Id', email: uniqueEmail(), role: 'student',
    })).rejects.toThrow(/associatedId is required/);
    await expect(provisionAccount(superAdmin, {
      name: 'Unknown Id', email: uniqueEmail(), role: 'student', associatedId: 'stu_missing',
    })).rejects.toThrow(/No existing student/);
  });

  it('denies an outside-class student id with or without a class hint', async () => {
    await seedAccountsIfMissing();
    await expect(provisionAccount(teacher, {
      name: 'Outside', email: uniqueEmail(), role: 'student', associatedId: 'stu_06', // cls_11
    })).rejects.toThrow(AccountPolicyError);

    const withHint = {
      name: 'Outside', email: uniqueEmail(), role: 'student' as const,
      associatedId: 'stu_06', studentClassId: 'cls_10', // must be ignored
    } as Parameters<typeof provisionAccount>[1];
    await expect(provisionAccount(teacher, withHint)).rejects.toThrow(AccountPolicyError);
  });

  it('allows a teacher to provision a student from an assigned class', async () => {
    await seedAccountsIfMissing();
    const created = await provisionAccount(teacher, {
      name: 'Inside', email: uniqueEmail(), role: 'student', associatedId: 'stu_08', // cls_12
    });
    expect(created.user.role).toBe('student');
    expect(created.user.associatedId).toBe('stu_08');
  });

  it('rejects a second login for the same associatedId and role', async () => {
    await seedAccountsIfMissing();
    await provisionAccount(superAdmin, {
      name: 'First', email: uniqueEmail(), role: 'student', associatedId: 'stu_02',
    });
    await expect(provisionAccount(superAdmin, {
      name: 'Second', email: uniqueEmail(), role: 'student', associatedId: 'stu_02',
    })).rejects.toThrow(/already exists/);

    await provisionAccount(superAdmin, {
      name: 'Parent One', email: uniqueEmail(), role: 'parent', associatedId: 'stu_02',
    });
    await expect(provisionAccount(superAdmin, {
      name: 'Parent Two', email: uniqueEmail(), role: 'parent', associatedId: 'stu_02',
    })).rejects.toThrow(/already exists/);
  });
});

describe('policy enforcement inside the service', () => {
  it('denies forbidden actors and roles', async () => {
    await seedAccountsIfMissing();
    await expect(provisionAccount(actorFor('student'), {
      name: 'Nope', email: uniqueEmail(), role: 'teacher',
    })).rejects.toThrow(AccountPolicyError);
    await expect(provisionAccount(actorFor('admin'), {
      name: 'Nope', email: uniqueEmail(), role: 'admin',
    })).rejects.toThrow(AccountPolicyError);
  });

  it('rejects forged actor ids and forged roles', async () => {
    await seedAccountsIfMissing();
    await expect(provisionAccount(
      { ...superAdmin, id: 'usr_made_up' },
      { name: 'Fake', email: uniqueEmail(), role: 'teacher' },
    )).rejects.toThrow(AccountPolicyError);

    const forgedTeacher = { ...teacher, role: 'super_admin' as const };
    await expect(provisionAccount(forgedTeacher, {
      name: 'Fake Admin', email: uniqueEmail(), role: 'admin',
    })).rejects.toThrow(AccountPolicyError);
    await expect(resetPassword(forgedTeacher, actorFor('admin').id))
      .rejects.toThrow(AccountPolicyError);
  });

  it('enforces the same policy on resetPassword', async () => {
    await seedAccountsIfMissing();
    await expect(resetPassword(teacher, actorFor('admin').id)).rejects.toThrow(AccountPolicyError);
    await expect(resetPassword(actorFor('parent'), actorFor('student').id)).rejects.toThrow(AccountPolicyError);
    await expect(resetPassword(superAdmin, superAdmin.id)).rejects.toThrow(AccountPolicyError);

    const created = await provisionAccount(teacher, {
      name: 'Reset Me', email: uniqueEmail(), role: 'student', associatedId: 'stu_08',
    });
    const reset = await resetPassword(teacher, created.user.id);
    expect(reset.temporaryPassword).not.toBe(created.temporaryPassword);
  });
});

describe('resetPassword', () => {
  it('invalidates the old password, enables the new one and flags mustChangePassword', async () => {
    await seedAccountsIfMissing();
    const created = await provisionAccount(superAdmin, {
      name: 'Resettable', email: uniqueEmail(), role: 'student', associatedId: 'stu_02',
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
      name: 'Changer', email: uniqueEmail(), role: 'student', associatedId: 'stu_03',
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

  it('locks after five wrong current passwords and recovers after a correct one', async () => {
    vi.useFakeTimers();
    await seedAccountsIfMissing();
    const created = await provisionAccount(superAdmin, {
      name: 'Change Locked', email: uniqueEmail(), role: 'teacher',
    });

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(changePassword(created.user.id, 'WrongCurrent1', 'BrandNew123'))
        .rejects.toThrow(/Current password is incorrect/);
    }
    expect(getLockRemainingMs(created.user.email)).toBeGreaterThan(0);
    await expect(changePassword(created.user.id, created.temporaryPassword, 'BrandNew123'))
      .rejects.toThrow(/Too many failed attempts/);

    vi.advanceTimersByTime(31_000);
    expect(getLockRemainingMs(created.user.email)).toBe(0);
    await changePassword(created.user.id, created.temporaryPassword, 'BrandNew123');
    expect(getLockRemainingMs(created.user.email)).toBe(0);

    for (let attempt = 0; attempt < 4; attempt += 1) {
      await expect(changePassword(created.user.id, 'WrongCurrent1', 'Another123'))
        .rejects.toThrow(/Current password is incorrect/);
    }
    expect(getLockRemainingMs(created.user.email)).toBe(0);
    await expect(changePassword(created.user.id, 'WrongCurrent1', 'Another123'))
      .rejects.toThrow(/Current password is incorrect/);
    expect(getLockRemainingMs(created.user.email)).toBeGreaterThan(0);
  });
});

describe('audit log', () => {
  it('records provision / reset / change without any password material', async () => {
    await seedAccountsIfMissing();
    const created = await provisionAccount(superAdmin, {
      name: 'Audited', email: uniqueEmail(), role: 'student', associatedId: 'stu_04',
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
      name: 'Throttled', email: uniqueEmail(), role: 'student', associatedId: 'stu_05',
    });
    expect(await verifyLogin(created.user.email, created.temporaryPassword)).not.toBeNull();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect(await verifyLogin(created.user.email, 'definitely-wrong')).toBeNull();
    }
    expect(getLockRemainingMs(created.user.email)).toBeGreaterThan(0);
    expect(await verifyLogin(created.user.email, created.temporaryPassword)).toBeNull();
  });
});

describe('seeded access and demo reset', () => {
  it('seeds one account per user and all seeded roles exist', async () => {
    await seedAccountsIfMissing();
    const accounts = JSON.parse(localStorage.getItem('smc_accounts') ?? '[]');
    expect(accounts).toHaveLength(ROLES.length);
    for (const role of ROLES) {
      expect(actorFor(role)).toBeTruthy();
    }
  });

  it('resetAllToDemo clears accounts/audit and re-seeds matching logins', async () => {
    await seedAccountsIfMissing();
    const created = await provisionAccount(superAdmin, {
      name: 'To Be Reset', email: uniqueEmail(), role: 'teacher',
    });
    expect(findAccountByUserId(created.user.id)).not.toBeNull();

    StorageService.resetAllToDemo();
    expect(localStorage.getItem('smc_accounts')).toBeNull();
    expect(localStorage.getItem('smc_audit_log')).toBeNull();

    await seedAccountsIfMissing();
    const users = StorageService.getUsers();
    const accounts = JSON.parse(localStorage.getItem('smc_accounts') ?? '[]');
    expect(accounts).toHaveLength(users.length);
    expect(accounts.every((account: { userId: string }) => users.some((u) => u.id === account.userId))).toBe(true);
    expect(await verifyLogin('alexander.cross@staugustine.edu', DEMO_PASSWORD)).toMatchObject({ role: 'super_admin' });
    expect(await verifyLogin(created.user.email, created.temporaryPassword)).toBeNull();
  });
});
