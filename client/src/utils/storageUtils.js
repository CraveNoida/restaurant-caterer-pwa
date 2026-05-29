export function getFromLocalStorage(key, fallback = null) {
  try {
    if (typeof window === "undefined") return fallback;
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function saveToLocalStorage(key, value) {
  try {
    if (typeof window === "undefined") return false;
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
