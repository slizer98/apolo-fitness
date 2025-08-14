// src/api/services.js
import http, { TOKEN_STORAGE_KEY, clearTokens, setEmpresaId , saveTokens } from "./http";

/**
 * Utils para tokens (el interceptor ya los usa si están en localStorage)
 */
function getTokens() {
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const accounts = {
  perfil() {
    // GET /accounts/perfil/ → { username, empresa: {id,nombre}, sucursal: {id,nombre}, rol }
    return http.get("accounts/perfil/");
  },
};

/**
 * AUTH
 */
const auth = {
  async login({ username, password }) {
    // SIEMPRE rutas SIN slash inicial para que respete /api/v1 de baseURL
    // POST a: {BASE_URL}/token/
    try {
      const { data } = await http.post("token/", { username, password });
      // data = { access, refresh }
      if (data?.access && data?.refresh) {
        saveTokens(data);
        return { success: true, ...data };
      }
      return { success: false, error: "Respuesta inválida del servidor" };
    } catch (e) {
      if (e.response) {
        if (e.response.status === 401) {
          return { success: false, error: "Usuario o contraseña inválidos" };
        }
        // DRF suele mandar {detail: "..."}
        const detail = e.response.data?.detail;
        return { success: false, error: detail || "Error al iniciar sesión" };
      }
      return { success: false, error: "No se pudo conectar con el servidor" };
    }
  },
  async refresh(refresh) {
    const { data } = await http.post("token/refresh/", { refresh });
    const tokens = getTokens() || {};
    saveTokens({ ...tokens, access: data.access });
    return data;
  },
  logout() {
    clearTokens();
  },
};

/**
 * SISTEMA
 */
const system = {
  ping() {
    return http.get("ping/");
  },
  health() {
    // Nota: tu /health/ está fuera de /api/v1 en el ejemplo, ajusta base si no lo mueves
    return http.get(new URL("health/", window.location.origin).pathname);
  },
  setEmpresa(id) {
    setEmpresaId(id);
  },
};

/**
 * EMPRESAS
 */
const empresas = {
  list(params) {
    return http.get("empresas/", { params });
  },
  retrieve(id) {
    return http.get(`empresas/${id}/`);
  },
  create(payload) {
    return http.post("empresas/", payload);
  },
  update(id, payload) {
    return http.put(`empresas/${id}/`, payload);
  },
  patch(id, payload) {
    return http.patch(`empresas/${id}/`, payload);
  },
  delete(id) {
    return http.delete(`empresas/${id}/`);
  },
};

/**
 * SUCURSALES
 */
const sucursales = {
  list(params) {
    return http.get("sucursales/", { params });
  },
  retrieve(id) {
    return http.get(`sucursales/${id}/`);
  },
  create(payload) {
    return http.post("sucursales/", payload);
  },
  update(id, payload) {
    return http.put(`sucursales/${id}/`, payload);
  },
  patch(id, payload) {
    return http.patch(`sucursales/${id}/`, payload);
  },
  delete(id) {
    return http.delete(`sucursales/${id}/`);
  },
};

/**
 * USUARIOS - EMPRESA
 */
const usuariosEmpresa = {
  list(params) {
    return http.get("usuarios-empresa/", { params });
  },
  retrieve(id) {
    return http.get(`usuarios-empresa/${id}/`);
  },
  create(payload) {
    return http.post("usuarios-empresa/", payload);
  },
  update(id, payload) {
    return http.put(`usuarios-empresa/${id}/`, payload);
  },
  patch(id, payload) {
    return http.patch(`usuarios-empresa/${id}/`, payload);
  },
  delete(id) {
    return http.delete(`usuarios-empresa/${id}/`);
  },
};

/**
 * CLIENTES (y subrecursos)
 */
const clientes = {
  list(params) {
    return http.get("clientes/", { params });
  },
  retrieve(id) {
    return http.get(`clientes/${id}/`);
  },
  create(payload) {
    return http.post("clientes/", payload);
  },
  update(id, payload) {
    return http.put(`clientes/${id}/`, payload);
  },
  patch(id, payload) {
    return http.patch(`clientes/${id}/`, payload);
  },
  delete(id) {
    return http.delete(`clientes/${id}/`);
  },

  // Datos de contacto
  datosContacto: {
    create(payload) {
      // { cliente, tipo, valor }
      return http.post("clientes/datos-contacto/", payload);
    },
    getByCliente(clienteId) {
      return http.get(`clientes/datos-contacto/${clienteId}`);
    },
  },

  // Datos fiscales
  datosFiscales: {
    create(payload) {
      return http.post("clientes/datos-fiscales/", payload);
    },
    getByCliente(clienteId) {
      return http.get(`clientes/datos-fiscales/${clienteId}`);
    },
  },

  // Convenios
  convenios: {
    create(payload) {
      return http.post("clientes/convenios/", payload);
    },
    getByCliente(clienteId) {
      return http.get(`clientes/convenios/${clienteId}`);
    },
  },

  // Características (catálogo por empresa o global)
  caracteristicas: {
    list(params) {
      return http.get("clientes/caracteristicas/", { params });
    },
    retrieve(id) {
      return http.get(`clientes/caracteristicas/${id}`);
    },
    create(payload) {
      return http.post("clientes/caracteristicas/", payload);
    },
    update(id, payload) {
      return http.put(`clientes/caracteristicas/${id}/`, payload);
    },
    patch(id, payload) {
      return http.patch(`clientes/caracteristicas/${id}/`, payload);
    },
    delete(id) {
      return http.delete(`clientes/caracteristicas/${id}/`);
    },
  },

  // Datos adicionales por cliente
  datosAdicionales: {
    create(payload) {
      return http.post("clientes/datos-adicionales/", payload);
    },
    getByCliente(clienteId) {
      return http.get(`clientes/datos-adicionales/${clienteId}`);
    },
  },

  // Relación cliente - sucursal
  clienteSucursales: {
    create(payload) {
      return http.post("clientes/sucursales/", payload);
    },
    getByCliente(clienteId) {
      return http.get(`clientes/sucursales/${clienteId}`);
    },
  },
};

/**
 * CONFIGURACIÓN
 */
const configuraciones = {
  create(payload) {
    // { nombre, tipo_dato, descripcion }
    return http.post("configuraciones/", payload);
  },
  list(params) {
    return http.get("configuraciones/", { params });
  },
};

const valoresConfiguracion = {
  create(payload) {
    // { configuracion, empresa, valor }
    return http.post("valores-configuracion/", payload);
  },
  getPorEmpresa(empresaId) {
    return http.get(`valores-configuracion/por-empresa/${empresaId}/`);
  },
};

/**
 * PLANES
 */
const planes = {
  list(params) {
    return http.get("planes/", { params });
  },
  retrieve(id) {
    return http.get(`planes/${id}/`);
  },
  create(payload) {
    return http.post("planes/", payload);
  },
  update(id, payload) {
    return http.put(`planes/${id}/`, payload);
  },
  patch(id, payload) {
    return http.patch(`planes/${id}/`, payload);
  },
  delete(id) {
    return http.delete(`planes/${id}/`);
  },

  precios: {
    create(payload) {
      // { plan, esquema, tipo, precio, numero_visitas, usuario }
      return http.post("planes/precios/", payload);
    },
    // si luego agregas list/get-by-plan:
    // listByPlan(planId) { return http.get(`/planes/${planId}/precios/`); }
  },

  restricciones: {
    create(payload) {
      // { plan, dia, hora_inicio, hora_fin, usuario }
      return http.post("planes/restricciones/", payload);
    },
    // listByPlan(planId) { return http.get(`/planes/${planId}/restricciones/`); }
  },
};

const api = {
  auth,
  accounts,
  system,
  empresas,
  sucursales,
  usuariosEmpresa,
  clientes,
  configuraciones,
  valoresConfiguracion,
  planes,
  // exporta helpers por si los necesitas en UI
  _helpers: { saveTokens, getTokens, clearTokens, setEmpresa: system.setEmpresa },
};

export default api;
