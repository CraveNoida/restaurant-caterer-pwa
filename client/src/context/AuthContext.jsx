import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService.js";
import { clearAuthSession, getStoredToken, getStoredUser, saveAuthSession } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getStoredToken());
  const [loading, setLoading] = useState(() => Boolean(getStoredToken()));

  useEffect(() => {
    const handleSessionCleared = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener("auth-session-cleared", handleSessionCleared);
    return () => window.removeEventListener("auth-session-cleared", handleSessionCleared);
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    authService
      .profile()
      .then((data) => {
        if (!isMounted) return;
        if (data?.user) {
          saveAuthSession({ user: data.user, token });
          setUser(data.user);
        }
      })
      .catch(() => {
        if (isMounted) clearAuthSession();
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const applySession = (session) => {
    saveAuthSession(session);
    setUser(session.user);
    setToken(session.token);
    return session;
  };

  const login = async (payload) => {
    setLoading(true);
    try {
      const session = await authService.login(payload);
      return applySession(session);
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const session = await authService.register(payload);
      return applySession(session);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthSession();
    setUser(null);
    setToken(null);
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await authService.profile();
      if (data?.user) {
        const session = { user: data.user, token: getStoredToken() };
        applySession(session);
        return data.user;
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      loading,
      login,
      register,
      logout,
      fetchProfile
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
