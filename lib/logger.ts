type LogLevel = "info" | "warn" | "error";

type LogPayload = {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
};

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
  info(message: string, context?: Record<string, unknown>) {
    log({ level: "info", message, context });
  },
  warn(message: string, context?: Record<string, unknown>) {
    log({ level: "warn", message, context });
  },
  error(message: string, context?: Record<string, unknown>) {
    log({ level: "error", message, context });
  },
};
