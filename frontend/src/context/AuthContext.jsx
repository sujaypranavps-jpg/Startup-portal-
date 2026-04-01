import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/endpoints';
import { attachAuthInterceptors } from '../api/client';

const AuthContext = createContext(null);

const STORAGE_KEY = 'startup_portal_auth';

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { user: null, accessToken: '', refreshToken: '' };
  });

  const setTokens = ({ accessToken, refreshToken }) => {
    setSession((prev) => ({ ...prev, accessToken, refreshToken }));
  };

  const clearSession = () => {
    setSession({ user: null, accessToken: '', refreshToken: '' });
    localStorage.removeItem(STORAGE_KEY);
  };

  useEffect(() => {
    attachAuthInterceptors(
      () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return { accessToken: '', refreshToken: '' };
        const parsed = JSON.parse(saved);
        return { accessToken: parsed.accessToken, refreshToken: parsed.refreshToken };
      },
      setTokens,
      clearSession
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  const login = (payload) => {
    setSession(payload);
  };

  const logout = async () => {
    if (session.refreshToken) {
      try {
        await authApi.logout(session.refreshToken);
      } catch {
        // no-op
      }
    }
    clearSession();
  };

  const value = useMemo(
    () => ({
      user: session.user,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      isAuthenticated: Boolean(session.accessToken && session.user),
      login,
      logout,
      setSession
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
