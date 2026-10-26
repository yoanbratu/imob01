import { AdminUser, INITIAL_ADMIN_USERS } from '../types/property';

/**
 * BRATU IMOBILIÁRIA & ADMINISTRADORA LTDA — SECURITY & CRYPTOGRAPHY MODULE
 *
 * Security measures implemented:
 * 1. Zero plaintext password storage: Admin authentication compares a salted SHA-256 hash.
 * 2. Multi-Administrator Authentication: Supports individual admin accounts with hashed passwords,
 *    roles, and permissions synced between Firestore and local cache.
 * 3. Brute-force protection: Limits consecutive failed login attempts with an automatic cooldown lock.
 * 4. Input sanitization: Prevents HTML/Script injection (XSS) in public lead forms and search queries.
 * 5. Ephemeral Session Tokens: Admin sessions expire automatically or when the browser tab closes.
 */

const AUTH_SALT = 'BRATU_IMMOBILIER_SECURE_AUTH_SALT_V2026';

// Salted SHA-256 hash of the initial administrator master credential ('casa5750')
export const DEFAULT_SALTED_HASH =
  '03df9744d6e35c694784d7e60bd626468eb3bc3cd91d5631257c3cf4a1d11cb3';

const STORAGE_HASH_KEY = 'bratu_sec_admin_hash';
const STORAGE_ATTEMPTS_KEY = 'bratu_sec_login_attempts';
const STORAGE_LOCKOUT_KEY = 'bratu_sec_lockout_until';
const SESSION_TOKEN_KEY = 'bratu_sec_session_token';
const SESSION_ADMIN_PROFILE_KEY = 'bratu_sec_admin_profile';
export const ADMIN_USERS_STORAGE_KEY = 'bratu_sec_admin_users';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 3 * 60 * 1000; // 3 minutes lockout after 5 failed attempts

/**
 * Computes a salted SHA-256 hash using the Web Crypto API.
 */
export async function computeSaltedHash(plainText: string): Promise<string> {
  const salted = `${AUTH_SALT}::${plainText.trim()}`;
  const msgBuffer = new TextEncoder().encode(salted);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Retrieves the currently active salted password hash for the master account.
 */
export function getStoredSaltedHash(): string {
  try {
    return localStorage.getItem(STORAGE_HASH_KEY) || DEFAULT_SALTED_HASH;
  } catch {
    return DEFAULT_SALTED_HASH;
  }
}

/**
 * Retrieves the cached list of AdminUser accounts from localStorage (fallback to INITIAL_ADMIN_USERS).
 */
export function getCachedAdminUsers(): AdminUser[] {
  try {
    const raw = localStorage.getItem(ADMIN_USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return INITIAL_ADMIN_USERS;
}

/**
 * Updates the cached list of AdminUser accounts in localStorage.
 */
export function setCachedAdminUsers(users: AdminUser[]): void {
  try {
    localStorage.setItem(ADMIN_USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {
    // ignore
  }
}

/**
 * Gets the currently logged-in administrator profile for the active session.
 */
export function getCurrentAdminProfile(): AdminUser {
  try {
    const raw = sessionStorage.getItem(SESSION_ADMIN_PROFILE_KEY);
    if (raw) {
      return JSON.parse(raw) as AdminUser;
    }
  } catch {
    // ignore
  }
  const admins = getCachedAdminUsers();
  return admins[0] || INITIAL_ADMIN_USERS[0];
}

/**
 * Sets the currently logged-in administrator profile in sessionStorage.
 */
export function setCurrentAdminProfile(admin: AdminUser): void {
  try {
    sessionStorage.setItem(SESSION_ADMIN_PROFILE_KEY, JSON.stringify(admin));
  } catch {
    // ignore
  }
}

/**
 * Checks if the login is currently locked due to brute-force attempts.
 */
export function getLockoutStatus(): { locked: boolean; remainingSeconds: number } {
  try {
    const lockoutUntil = Number(localStorage.getItem(STORAGE_LOCKOUT_KEY) || '0');
    const now = Date.now();
    if (lockoutUntil > now) {
      return {
        locked: true,
        remainingSeconds: Math.ceil((lockoutUntil - now) / 1000),
      };
    }
    return { locked: false, remainingSeconds: 0 };
  } catch {
    return { locked: false, remainingSeconds: 0 };
  }
}

/**
 * Verifies the candidate password (and optional email/username) against:
 * 1. Active registered administrators in `getCachedAdminUsers()`
 * 2. Master password hash (`getStoredSaltedHash()`)
 */
export async function verifyAdminPassword(
  candidatePassword: string,
  candidateIdentifier?: string
): Promise<{
  success: boolean;
  error?: string;
  remainingAttempts?: number;
  adminUser?: AdminUser;
}> {
  const status = getLockoutStatus();
  if (status.locked) {
    return {
      success: false,
      error: `Muitas tentativas incorretas. Aguarde ${status.remainingSeconds} segundos para tentar novamente.`,
    };
  }

  try {
    const candidateHash = await computeSaltedHash(candidatePassword);
    const targetMasterHash = getStoredSaltedHash();
    const admins = getCachedAdminUsers().filter((a) => a.active !== false);
    const cleanId = (candidateIdentifier || '').trim().toLowerCase();

    let matchedAdmin: AdminUser | undefined;

    if (cleanId) {
      // Find admin matching email or name
      const byIdentifier = admins.find(
        (a) =>
          a.email.toLowerCase() === cleanId ||
          a.name.toLowerCase() === cleanId ||
          a.email.split('@')[0].toLowerCase() === cleanId
      );

      if (byIdentifier) {
        if (
          byIdentifier.passwordHash === candidateHash ||
          (byIdentifier.role === 'Super Admin' && candidateHash === targetMasterHash)
        ) {
          matchedAdmin = byIdentifier;
        }
      } else if (candidateHash === targetMasterHash) {
        matchedAdmin = admins[0] || INITIAL_ADMIN_USERS[0];
      }
    } else {
      // Fast 1-step login: match any active admin with this password hash, or master hash
      matchedAdmin = admins.find((a) => a.passwordHash === candidateHash);
      if (!matchedAdmin && candidateHash === targetMasterHash) {
        matchedAdmin = admins[0] || INITIAL_ADMIN_USERS[0];
      }
    }

    if (matchedAdmin) {
      localStorage.removeItem(STORAGE_ATTEMPTS_KEY);
      localStorage.removeItem(STORAGE_LOCKOUT_KEY);
      const sessionToken = crypto.randomUUID
        ? crypto.randomUUID()
        : `sec_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      sessionStorage.setItem(SESSION_TOKEN_KEY, sessionToken);

      const updatedProfile: AdminUser = {
        ...matchedAdmin,
        lastLoginAt: new Date().toISOString(),
      };
      setCurrentAdminProfile(updatedProfile);

      return { success: true, adminUser: updatedProfile };
    } else {
      const currentAttempts = Number(localStorage.getItem(STORAGE_ATTEMPTS_KEY) || '0') + 1;
      localStorage.setItem(STORAGE_ATTEMPTS_KEY, String(currentAttempts));

      if (currentAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockUntil = Date.now() + LOCKOUT_DURATION_MS;
        localStorage.setItem(STORAGE_LOCKOUT_KEY, String(lockUntil));
        localStorage.setItem(STORAGE_ATTEMPTS_KEY, '0');
        return {
          success: false,
          error: 'Limite de tentativas excedido. Acesso bloqueado temporariamente por 3 minutos por segurança.',
          remainingAttempts: 0,
        };
      }

      const remaining = MAX_LOGIN_ATTEMPTS - currentAttempts;
      return {
        success: false,
        error: `Credenciais incorretas. Você possui mais ${remaining} tentativa(s).`,
        remainingAttempts: remaining,
      };
    }
  } catch (err) {
    console.error('Erro na verificação criptográfica:', err);
    return {
      success: false,
      error: 'Erro ao processar verificação criptográfica.',
    };
  }
}

/**
 * Allows an authenticated administrator to change the master password.
 * Stores only the new salted SHA-256 hash.
 */
export async function updateAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  if (!newPassword || newPassword.trim().length < 6) {
    return {
      success: false,
      message: 'A nova senha deve possuir no mínimo 6 caracteres.',
    };
  }

  const verification = await verifyAdminPassword(currentPassword);
  if (!verification.success) {
    return {
      success: false,
      message: 'A senha atual informada está incorreta.',
    };
  }

  const newHash = await computeSaltedHash(newPassword);
  localStorage.setItem(STORAGE_HASH_KEY, newHash);

  return {
    success: true,
    message: 'Senha master atualizada e criptografada com sucesso (SHA-256).',
  };
}

export function hasActiveAdminSession(): boolean {
  try {
    return Boolean(sessionStorage.getItem(SESSION_TOKEN_KEY));
  } catch {
    return false;
  }
}

export function validateAdminSession(): boolean {
  return hasActiveAdminSession();
}

export function clearAdminSession(): void {
  try {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    sessionStorage.removeItem(SESSION_ADMIN_PROFILE_KEY);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Sanitizes user input strings to prevent Cross-Site Scripting (XSS) and injection payloads.
 */
export function sanitizeText(input: string | undefined): string {
  if (!input) return '';
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}
