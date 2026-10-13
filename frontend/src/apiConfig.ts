export const API_BASE = (import.meta.env.VITE_API_URL || 'https://taskclash-api.onrender.com').replace(/\/$/,'');

export const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getJsonHeaders = (): Record<string, string> => {
  return {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
  };
};
