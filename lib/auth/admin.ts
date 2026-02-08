function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Devuelve true si existe allowlist de admin.
 */
export function hasAdminAllowlist() {
  return getAdminEmails().length > 0;
}

/**
 * Determina si un email tiene permisos de admin.
 * Si no hay allowlist configurada, se rechaza por seguridad.
 * @param email - Email del usuario.
 */
export function isAdminEmail(email?: string | null) {
  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) {
    return false;
  }

  const normalizedEmail = (email ?? "").toLowerCase().trim();
  return normalizedEmail ? adminEmails.includes(normalizedEmail) : false;
}
