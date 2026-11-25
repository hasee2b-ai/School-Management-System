/**
 * SIMULATED, CLIENT-SIDE AUTHENTICATION ONLY.
 * This is a front-end demo with no backend: account records and hashes live in
 * localStorage and can be inspected or tampered with by anyone using the browser.
 * A real backend (server-side credential storage, issuing/verifying sessions,
 * rate limiting, password-change enforcement) MUST replace this service before
 * any real student, staff, or financial data is used.
 */
import { Role, User } from '../types/index.ts';
import { StorageService } from './storage.ts';
import { AccountPolicyError, canProvisionAccount } from './accountPolicy.ts';

export interface Account {
  userId: string;
  email: string; // lowercased
  salt: string; // hex
  passwordHash: string; // hex, PBKDF2-SHA-256
  mustChangePassword: boolean;
}

export interface AuditEntry {
  at: string;
  actorId: string;
  action: 'provision' | 'reset_password' | 'change_password';
  targetUserId: string;
  targetRole: Role;
}

export interface ProvisionInput {
  name: string;
  email: string;
  role: Role;
  associatedId?: string;
}

/** Demo-only seed data: every seeded account starts with this password. */
export const DEMO_PASSWORD = 'Demo@2026!';

const ACCOUNTS_KEY = 'smc_accounts';
const AUDIT_KEY = 'smc_audit_log';
const SALT_BYTES = 16;
const PBKDF2_ITERATIONS = 100000;
const HASH_BITS = 256;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 30_000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Look-alike characters excluded: 0/O/o and 1/l/I.
const TEMP_UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const TEMP_LOWER = 'abcdefghijkmnpqrstuvwxyz';
const TEMP_DIGITS = '23456789';
const TEMP_CHARS = TEMP_UPPER + TEMP_LOWER + TEMP_DIGITS;
const TEMP_LENGTH = 12;

interface AttemptState {
  count: number;
  lockedUntil: number;
}

// In-memory throttle state only: resets on page reload.
const failedAttempts = new Map<string, AttemptState>();
let seedPromise: Promise<void> | null = null;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isAccount(value: unknown): value is Account {
  if (!value || typeof value !== 'object') return false;
  const account = value as Record<string, unknown>;
  return (
    typeof account.userId === 'string' &&
    account.userId.length > 0 &&
    typeof account.email === 'string' &&
    account.email.length > 0 &&
    account.email === account.email.toLowerCase() &&
    typeof account.salt === 'string' &&
    account.salt.length > 0 &&
    typeof account.passwordHash === 'string' &&
    account.passwordHash.length > 0 &&
    typeof account.mustChangePassword === 'boolean'
  );
}

function readAccounts(): Account[] | null {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(isAccount)) return null;
    const userIds = new Set(parsed.map((account) => account.userId));
    const emails = new Set(parsed.map((account) => account.email));
    if (userIds.size !== parsed.length || emails.size !== parsed.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeAccounts(accounts: Account[]): void {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.warn('Could not save accounts', e);
  }
}

function appendAudit(entry: AuditEntry): void {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    const entries: AuditEntry[] = Array.isArray(parsed) ? parsed : [];
    entries.push(entry);
    localStorage.setItem(AUDIT_KEY, JSON.stringify(entries));
  } catch (e) {
    console.warn('Could not write audit log', e);
  }
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex: string): Uint8Array<ArrayBuffer> | null {
  if (hex.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(hex)) return null;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function randomChar(chars: string): string {
  const index = crypto.getRandomValues(new Uint8Array(1))[0] % chars.length;
  return chars[index];
}

/** 12 random chars, no look-alikes, guaranteed upper + lower + digit. */
function generateTemporaryPassword(): string {
  const chars = [
    randomChar(TEMP_UPPER),
    randomChar(TEMP_LOWER),
    randomChar(TEMP_DIGITS),
  ];
  for (let i = chars.length; i < TEMP_LENGTH; i += 1) {
    chars.push(randomChar(TEMP_CHARS));
  }
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = crypto.getRandomValues(new Uint8Array(1))[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

async function deriveHash(password: string, saltHex: string): Promise<string> {
  const salt = fromHex(saltHex);
  if (!salt) throw new Error('Invalid account salt');
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PBKDF2_ITERATIONS },
    key,
    HASH_BITS,
  );
  return toHex(new Uint8Array(bits));
}

async function buildAccount(
  userId: string,
  email: string,
  password: string,
  mustChangePassword: boolean,
): Promise<Account> {
  const salt = toHex(crypto.getRandomValues(new Uint8Array(SALT_BYTES)));
  return {
    userId,
    email: normalizeEmail(email),
    salt,
    passwordHash: await deriveHash(password, salt),
    mustChangePassword,
  };
}

async function seedAccounts(): Promise<void> {
  const existing = readAccounts();
  const accounts = existing ?? [];
  const users = StorageService.getUsers();
  const missing = users.filter((user) => !accounts.some((a) => a.userId === user.id));
  if (accounts.length > 0 && missing.length === 0) return;
  for (const user of missing) {
    accounts.push(await buildAccount(user.id, user.email, DEMO_PASSWORD, false));
  }
  writeAccounts(accounts);
}

/** Seeds once per page load (memoized so concurrent callers share one run). */
export function seedAccountsIfMissing(): Promise<void> {
  const accounts = readAccounts();
  if (!accounts || accounts.length === 0 || !seedPromise) {
    seedPromise = seedAccounts().catch((e) => {
      seedPromise = null;
      console.warn('Could not seed demo accounts', e);
    });
  }
  return seedPromise;
}

function validateEmail(email: string): string {
  const normalized = normalizeEmail(email);
  if (!EMAIL_PATTERN.test(normalized)) {
    throw new AccountPolicyError('Invalid email address.');
  }
  return normalized;
}

function emailIsTaken(email: string): boolean {
  return (readAccounts() ?? []).some((account) => account.email === email)
    || StorageService.getUsers().some((user) => normalizeEmail(user.email) === email);
}

function teacherClassIdsFor(actor: User): string[] {
  if (actor.role !== 'teacher' || !actor.associatedId) return [];
  return StorageService.getTeachers().find((teacher) => teacher.id === actor.associatedId)?.assignedClassIds ?? [];
}

/** Class is derived from the student record only - never from caller input. */
function studentClassFor(associatedId?: string): string | undefined {
  if (!associatedId) return undefined;
  return StorageService.getStudents().find((student) => student.id === associatedId)?.classId;
}

/** Resolve the actor from persisted users; never trust the role on the passed object. */
function resolveStoredActor(actor: User): User {
  const stored = StorageService.getUsers().find((user) => user.id === actor.id);
  if (!stored || stored.role !== actor.role) {
    throw new AccountPolicyError('Actor identity could not be verified.');
  }
  return stored;
}

function enforcePolicy(actor: User, target: { role: Role; studentClassId?: string; userId?: string }): void {
  const decision = canProvisionAccount(actor, target, teacherClassIdsFor(actor));
  if (!decision.allowed) throw new AccountPolicyError(decision.reason ?? 'Not allowed.');
}

function registerFailedAttempt(email: string): void {
  const key = normalizeEmail(email);
  const now = Date.now();
  const previous = failedAttempts.get(key);
  // A state with lockedUntil === 0 is still accumulating; an expired lock restarts at 1.
  const count = previous && previous.lockedUntil === 0 ? previous.count + 1 : 1;
  failedAttempts.set(key, {
    count,
    lockedUntil: count >= MAX_FAILED_ATTEMPTS ? now + LOCKOUT_MS : 0,
  });
}

export function findAccountByEmail(email: string): Account | null {
  const normalized = normalizeEmail(email);
  const accounts = readAccounts();
  return accounts?.find((account) => account.email === normalized) ?? null;
}

export function findAccountByUserId(userId: string): Account | null {
  const accounts = readAccounts();
  return accounts?.find((account) => account.userId === userId) ?? null;
}

export function getMustChangePassword(userId: string): boolean {
  return findAccountByUserId(userId)?.mustChangePassword ?? false;
}

export async function createAccount(
  userId: string,
  email: string,
  password: string,
  mustChangePassword: boolean,
): Promise<Account> {
  if (!userId.trim() || !email.trim() || !password) {
    throw new Error('userId, email and password are required');
  }
  const normalized = normalizeEmail(email);
  const accounts = readAccounts() ?? [];
  if (accounts.some((a) => a.userId === userId || a.email === normalized)) {
    throw new Error('An account with that userId or email already exists');
  }
  const account = await buildAccount(userId, normalized, password, mustChangePassword);
  accounts.push(account);
  writeAccounts(accounts);
  return account;
}

/** Provision a brand-new user + login. Temporary password is returned only here. */
export async function provisionAccount(
  actor: User,
  input: ProvisionInput,
): Promise<{ user: User; temporaryPassword: string }> {
  await seedAccountsIfMissing();

  const storedActor = resolveStoredActor(actor);

  let studentClassId: string | undefined;
  if (input.role === 'student') {
    if (!input.associatedId) {
      throw new AccountPolicyError('A student associatedId is required.');
    }
    studentClassId = studentClassFor(input.associatedId);
    if (!studentClassId) {
      throw new AccountPolicyError('No existing student matches that associatedId.');
    }
  }
  enforcePolicy(storedActor, { role: input.role, studentClassId });

  if (input.associatedId && StorageService.getUsers().some(
    (user) => user.associatedId === input.associatedId && user.role === input.role,
  )) {
    throw new AccountPolicyError('A user with this associatedId and role already exists.');
  }

  if (!input.name?.trim()) throw new AccountPolicyError('A name is required.');
  const email = validateEmail(input.email);
  if (emailIsTaken(email)) throw new AccountPolicyError('An account with this email already exists.');

  const user: User = {
    id: `usr_${crypto.randomUUID()}`,
    name: input.name.trim(),
    email,
    role: input.role,
    ...(input.associatedId ? { associatedId: input.associatedId } : {}),
  };
  const temporaryPassword = generateTemporaryPassword();
  const account = await buildAccount(user.id, email, temporaryPassword, true);

  const users = StorageService.getUsers();
  users.push(user);
  StorageService.saveUsers(users);
  const accounts = readAccounts() ?? [];
  accounts.push(account);
  writeAccounts(accounts);

  appendAudit({
    at: new Date().toISOString(),
    actorId: storedActor.id,
    action: 'provision',
    targetUserId: user.id,
    targetRole: input.role,
  });
  return { user, temporaryPassword };
}

/** Reset an existing user's login to a new one-time temporary password. */
export async function resetPassword(
  actor: User,
  targetUserId: string,
): Promise<{ temporaryPassword: string }> {
  await seedAccountsIfMissing();

  const storedActor = resolveStoredActor(actor);
  const targetUser = StorageService.getUsers().find((user) => user.id === targetUserId);
  if (!targetUser) throw new Error('Target user not found.');
  const studentClassId = targetUser.role === 'student'
    ? studentClassFor(targetUser.associatedId)
    : undefined;
  enforcePolicy(storedActor, { role: targetUser.role, studentClassId, userId: targetUser.id });

  const accounts = readAccounts() ?? [];
  const account = accounts.find((item) => item.userId === targetUserId);
  if (!account) throw new Error('No account exists for that user.');

  const temporaryPassword = generateTemporaryPassword();
  const salt = toHex(crypto.getRandomValues(new Uint8Array(SALT_BYTES)));
  account.salt = salt;
  account.passwordHash = await deriveHash(temporaryPassword, salt);
  account.mustChangePassword = true;
  writeAccounts(accounts);
  failedAttempts.delete(account.email);

  appendAudit({
    at: new Date().toISOString(),
    actorId: storedActor.id,
    action: 'reset_password',
    targetUserId,
    targetRole: targetUser.role,
  });
  return { temporaryPassword };
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await seedAccountsIfMissing();

  const accounts = readAccounts() ?? [];
  const account = accounts.find((item) => item.userId === userId);
  if (!account) throw new Error('No account exists for that user.');

  if (getLockRemainingMs(account.email) > 0) {
    throw new Error('Too many failed attempts. Try again later.');
  }
  if (await deriveHash(currentPassword, account.salt) !== account.passwordHash) {
    registerFailedAttempt(account.email);
    throw new Error('Current password is incorrect.');
  }
  if (newPassword.length < 8) throw new Error('New password must be at least 8 characters.');
  if (newPassword === currentPassword) throw new Error('New password must differ from the current password.');
  if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
    throw new Error('New password must contain a letter and a digit.');
  }

  const salt = toHex(crypto.getRandomValues(new Uint8Array(SALT_BYTES)));
  account.salt = salt;
  account.passwordHash = await deriveHash(newPassword, salt);
  account.mustChangePassword = false;
  writeAccounts(accounts);
  failedAttempts.delete(account.email);

  const targetRole = StorageService.getUsers().find((user) => user.id === userId)?.role;
  if (targetRole) {
    appendAudit({
      at: new Date().toISOString(),
      actorId: userId,
      action: 'change_password',
      targetUserId: userId,
      targetRole,
    });
  }
}

/** Remaining lockout milliseconds for an email (0 when not locked). */
export function getLockRemainingMs(email: string): number {
  const state = failedAttempts.get(normalizeEmail(email));
  if (!state) return 0;
  return Math.max(0, state.lockedUntil - Date.now());
}

export async function verifyLogin(email: string, password: string): Promise<User | null> {
  await seedAccountsIfMissing();

  const key = normalizeEmail(email);
  if (getLockRemainingMs(key) > 0) return null;

  const account = findAccountByEmail(key);
  // Derive even for unknown emails so the timing does not reveal account existence.
  const saltHex = account?.salt ?? '00'.repeat(SALT_BYTES);
  let hash: string;
  try {
    hash = await deriveHash(password, saltHex);
  } catch {
    hash = '';
  }

  if (account && hash && hash === account.passwordHash) {
    failedAttempts.delete(key);
    return StorageService.getUsers().find((user) => user.id === account.userId) ?? null;
  }

  registerFailedAttempt(key);
  return null;
}
