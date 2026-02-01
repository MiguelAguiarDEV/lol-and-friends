type LogLevel = "info" | "warn" | "error";

type LogPayload = {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
};

/**
 * Emite un log estructurado en JSON a stdout/stderr según el nivel.
 * @param payload - Datos del log.
 * @param payload.level - Nivel de severidad.
 * @param payload.message - Mensaje principal.
 * @param payload.context - Contexto adicional.
 * @returns void.
 */
function log(payload: LogPayload) {
  const entry = {
    timestamp: new Date().toISOString(),
    service: "lol-and-friends",
    ...payload,
  };

  if (payload.level === "error") {
    console.error(JSON.stringify(entry));
  } else if (payload.level === "warn") {
    console.warn(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

export const logger = {
  /**
   * Log informativo.
   * @param message - Mensaje principal.
   * @param context - Contexto adicional.
   * @returns void.
   */
  info(message: string, context?: Record<string, unknown>) {
    log({ level: "info", message, context });
  },
  /**
   * Log de advertencia.
   * @param message - Mensaje principal.
   * @param context - Contexto adicional.
   * @returns void.
   */
  warn(message: string, context?: Record<string, unknown>) {
    log({ level: "warn", message, context });
  },
  /**
   * Log de error.
   * @param message - Mensaje principal.
   * @param context - Contexto adicional.
   * @returns void.
   */
  error(message: string, context?: Record<string, unknown>) {
    log({ level: "error", message, context });
  },
};
