const ALLOWED_APP_MODES = ["customer", "admin", "delivery"];

export function getAppMode() {
  const mode = import.meta.env.VITE_APP_MODE || "customer";
  return ALLOWED_APP_MODES.includes(mode) ? mode : "customer";
}

export function isAdminMode() {
  return getAppMode() === "admin";
}

export function isDeliveryMode() {
  return getAppMode() === "delivery";
}
