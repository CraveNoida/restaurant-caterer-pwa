const LOCAL_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173"
];

export function getAllowedOrigins() {
  const configured = (process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configured.length) return configured;
  return process.env.NODE_ENV === "production" ? [] : LOCAL_ORIGINS;
}

export function isOriginAllowed(origin) {
  if (!origin) return true;
  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.includes(origin);
}

export function corsOrigin(origin, callback) {
  if (isOriginAllowed(origin)) return callback(null, true);
  const error = new Error("Not allowed by CORS");
  error.statusCode = 403;
  return callback(error);
}
