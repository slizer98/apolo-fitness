// src/stores/auth.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/api/services";
import { TOKEN_STORAGE_KEY } from "@/api/http";

/** Decodifica un JWT sin verificar firma (solo para leer payload en cliente) */
function decodeJWT(token) {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

export const useAuthStore = defineStore("auth", () => {
  // STATE
  const access = ref(null);
  const refresh = ref(null);
  const user = ref(null); // perfil mínimo (derivado del token)
  const loading = ref(false);

  // GETTERS
  const isAuthenticated = computed(() => !!access.value);
  const currentUser = computed(() => user.value);
  const tokenInfo = computed(() => (access.value ? decodeJWT(access.value) : null));
  const tokenExpiresAt = computed(() => (tokenInfo.value?.exp ? tokenInfo.value.exp * 1000 : null));

  // HELPERS
  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      access.value = data.access || null;
      refresh.value = data.refresh || null;

      // reconstruye user básico desde el access si existe
      if (access.value) {
        const info = decodeJWT(access.value);
        user.value = {
          id: info?.user_id ?? info?.id ?? null,
          username: info?.username ?? null,
        };
      }
    } catch {
      // noop
    }
  }

  function persist() {
    localStorage.setItem(
      TOKEN_STORAGE_KEY,
      JSON.stringify({ access: access.value, refresh: refresh.value })
    );
  }

  function clear() {
    access.value = null;
    refresh.value = null;
    user.value = null;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  // ACTIONS
  async function login({ username, password }) {
    loading.value = true;
    try {
      // Tu endpoint real: POST /token/  -> { access, refresh }
      const tokens = await api.auth.login({ username, password });
      access.value = tokens.access;
      refresh.value = tokens.refresh;
      persist();

      // Derivar user básico del access
      const info = decodeJWT(access.value);
      user.value = {
        id: info?.user_id ?? info?.id ?? null,
        username: info?.username ?? username ?? null,
      };

      return { success: true, user: user.value };
    } catch (err) {
      const msg = err.response?.data?.detail || "Usuario o contraseña inválidos";
      return { success: false, error: msg };
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    api.auth.logout(); // limpia tokens en http utils
    clear();
  }

  /** Inicializa estado desde localStorage al arrancar la app */
  function init() {
    loadFromStorage();
  }

  /** (Opcional) Forzar refresh manual si alguna vista lo requiere */
  async function refreshAccess() {
    if (!refresh.value) return { success: false, error: "No hay refresh token" };
    try {
      const { access: newAccess } = await api.auth.refresh(refresh.value);
      access.value = newAccess;
      persist();
      const info = decodeJWT(newAccess);
      user.value = {
        id: info?.user_id ?? info?.id ?? null,
        username: info?.username ?? user.value?.username ?? null,
      };
      return { success: true };
    } catch (e) {
      clear();
      return { success: false, error: "No se pudo refrescar la sesión" };
    }
  }

  // AUTO-INIT
  init();

  return {
    // state
    access, refresh, user, loading,
    // getters
    isAuthenticated, currentUser, tokenInfo, tokenExpiresAt,
    // actions
    login, logout, init, refreshAccess,
  };
});
