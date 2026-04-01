import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false
});

export const attachAuthInterceptors = (getTokens, setTokens, clearSession) => {
  api.interceptors.request.use((config) => {
    const { accessToken } = getTokens();
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original = error.config;
      if (error.response?.status === 401 && !original._retry) {
        original._retry = true;
        const { refreshToken } = getTokens();
        if (!refreshToken) {
          clearSession();
          return Promise.reject(error);
        }

        try {
          const response = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
          setTokens({ accessToken: response.data.accessToken, refreshToken: response.data.refreshToken });
          original.headers.Authorization = `Bearer ${response.data.accessToken}`;
          return api(original);
        } catch (refreshErr) {
          clearSession();
          return Promise.reject(refreshErr);
        }
      }
      return Promise.reject(error);
    }
  );
};
