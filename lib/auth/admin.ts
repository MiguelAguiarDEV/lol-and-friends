const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

/**
 * Devuelve true si existe allowlist de admin.
 */
export function hasAdminAllowlist() {
  return adminEmails.length > 0;
}

/**
 * Determina si un email tiene permisos de admin.
 * Si no hay allowlist configurada, se considera admin.
 * @param email - Email del usuario.
 */
export function isAdminEmail(email?: string | null) {
  if (!hasAdminAllowlist()) {
    return true;
  }
  const normalizedEmail = (email ?? "").toLowerCase().trim();
  return normalizedEmail ? adminEmails.includes(normalizedEmail) : false;
}
