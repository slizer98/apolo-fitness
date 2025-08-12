// src/api/http.js
import axios from "axios";

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL; // p.ej. http://127.0.0.1:8000/api/v1
export const TOKEN_STORAGE_KEY = import.meta.env.VITE_TOKEN_STORAGE_KEY || "agora.tokens";

let EMPRESA_ID = import.meta.env.VITE_EMPRESA_ID || "1";

// Normaliza baseURL: sin trailing slash
const BASE_URL = (RAW_BASE_URL || "").replace(/\/+$/, "");

// === Estado para refresh ===
let isRefreshing = false;
let refreshQueue = [];

// ---- helpers de cola refresh ----
function flushRefreshQueue(error, newAccessToken = null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(newAccessToken);
  });
  refreshQueue = [];
}

// === Tokens en storage ===
export function getTokens() {
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveTokens(tokens) {
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function setEmpresaId(newId) {
  EMPRESA_ID = String(newId || "1");
}

// === Cliente axios ===
// OJO: usa BASE_URL como base real, y en los .post() usa rutas **sin** slash inicial
const http = axios.create({
  baseURL: BASE_URL + "/", // asegura 1 slash
  timeout: 20000,
});

// === Interceptor de request ===
http.interceptors.request.use((config) => {
  const tokens = getTokens();

  if (tokens?.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`;
  }

  config.headers["X-Empresa-Id"] = EMPRESA_ID;
  return config;
});

// === Interceptor de response (401 -> refresh) ===
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (!original || original.__isRetryRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      const tokens = getTokens();
      if (!tokens?.refresh) {
        clearTokens();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (newAccess) => {
              original.headers.Authorization = `Bearer ${newAccess}`;
              resolve(http(original));
            },
            reject,
          });
        });
      }

      original.__isRetryRequest = true;
      isRefreshing = true;

      try {
        // IMPORTANTE: no meter slash inicial en la ruta, y pegarla a BASE_URL
        const { data } = await axios.post(`${BASE_URL}/token/refresh/`, {
          refresh: tokens.refresh,
        });

        const newAccess = data.access;
        if (!newAccess) throw new Error("No se recibió access token en refresh");

        saveTokens({ ...tokens, access: newAccess });

        flushRefreshQueue(null, newAccess);
        isRefreshing = false;

        original.headers.Authorization = `Bearer ${newAccess}`;
        return http(original);
      } catch (refreshErr) {
        flushRefreshQueue(refreshErr, null);
        isRefreshing = false;
        clearTokens();
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default http;
