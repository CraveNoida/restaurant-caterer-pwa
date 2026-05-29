const getDefaultApiUrl = () => {
  if (typeof window === "undefined") return "http://localhost:5000/api";
  return `${window.location.protocol}//${window.location.hostname}:5000/api`;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || getDefaultApiUrl();
const AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_KEY = "currentUser";
const LEGACY_AUTH_TOKEN_KEY = "ahmad_auth_token";
const LEGACY_AUTH_USER_KEY = "ahmad_auth_user";

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function getStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(LEGACY_AUTH_TOKEN_KEY);
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_USER_KEY) || localStorage.getItem(LEGACY_AUTH_USER_KEY) || "null");
  } catch (error) {
    return null;
  }
}

export function saveAuthSession({ token, user }) {
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
  if (user) localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
  localStorage.removeItem(LEGACY_AUTH_USER_KEY);
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
  localStorage.removeItem(LEGACY_AUTH_USER_KEY);
  window.dispatchEvent(new Event("auth-session-cleared"));
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  return response.json();
}

export async function apiRequest(path, options = {}) {
  const method = options.method || "GET";
  if (typeof navigator !== "undefined" && !navigator.onLine && method !== "GET") {
    throw new ApiError("You are offline. Please reconnect before saving changes.", 0, null);
  }

  const token = getStoredToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers
    });
    const data = await parseResponse(response);

    if (!response.ok) {
      if (response.status === 401) clearAuthSession();
      throw new ApiError(data?.message || "Something went wrong. Please try again.", response.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Unable to reach the server. Please check your connection.", 0, null);
  }
}

export const api = {
  get: (path) => apiRequest(path),
  post: (path, payload) => apiRequest(path, { method: "POST", body: JSON.stringify(payload) }),
  put: (path, payload) => apiRequest(path, { method: "PUT", body: JSON.stringify(payload) }),
  delete: (path) => apiRequest(path, { method: "DELETE" })
};
