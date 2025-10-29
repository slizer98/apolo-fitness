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
    return http.get("accounts/perfil/");
  },
  usuarios: {
    list(params) { return http.get("accounts/usuarios/", { params }); },
    retrieve(id) { return http.get(`accounts/usuarios/${id}/`); },
    create(payload) { return http.post("accounts/usuarios/", payload); },
    update(id, payload) { return http.put(`accounts/usuarios/${id}/`, payload); },
    patch(id, payload) { return http.patch(`accounts/usuarios/${id}/`, payload); },
    delete(id) { return http.delete(`accounts/usuarios/${id}/`); },
  }
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
  resumen: (id) => http.get(`/clientes/${id}/resumen/`),
  
  setAvatar(id, file){
    const form = new FormData()
    form.append('avatar', file)
    return http.post(`clientes/${id}/avatar/`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: e => {
        // opcional: progreso
        // console.log(Math.round((e.loaded * 100) / e.total))
      }
    })
  },

  datosContacto: {
    create(payload) { return http.post("clientes/datos-contacto/", payload); },
    getByCliente(clienteId) {
      return http.get("clientes/datos-contacto/", { params: { cliente: clienteId, ordering: "-id", page_size: 100 } });
    },
  },

  datosFiscales: {
    create(payload) { return http.post("clientes/datos-fiscales/", payload); },
    getByCliente(clienteId) {
      // OneToOne en tu modelo -> el backend devolverá [] o [obj]
      return http.get("clientes/datos-fiscales/", { params: { cliente: clienteId } });
    },
  },

  datosAdicionales: {
    create(payload) { return http.post("clientes/datos-adicionales/", payload); },
    getByCliente(clienteId) {
      return http.get("clientes/datos-adicionales/", { params: { cliente: clienteId, ordering: "-id", page_size: 200 } });
    },
  },

  clienteSucursales: {
    create(payload) { return http.post("clientes/sucursales/", payload); },
    getByCliente(clienteId) {
      return http.get("clientes/sucursales/", { params: { cliente: clienteId, ordering: "-id", page_size: 50 } });
    },
  },

  // Características (catálogo por empresa o global)
  caracteristicas: {
    list(params) { return http.get("clientes/caracteristicas/", { params }); },
    retrieve(id) { return http.get(`clientes/caracteristicas/${id}/`); },
    create(payload) { return http.post("clientes/caracteristicas/", payload); },
    update(id, payload) { return http.put(`clientes/caracteristicas/${id}/`, payload); },
    patch(id, payload) { return http.patch(`clientes/caracteristicas/${id}/`, payload); },
    delete(id) { return http.delete(`clientes/caracteristicas/${id}/`); },
  },


};

const convenios = {
  list(params){ return http.get("clientes/convenios/", { params }) }, // ?empresa=[header], ?cliente=
  retrieve(id){ return http.get(`clientes/convenios/${id}/`) },
  create(payload){ return http.post("clientes/convenios/", payload) }, // empresa viene del header
  patch(id, payload){ return http.patch(`clientes/convenios/${id}/`, payload) },
  delete(id){ return http.delete(`clientes/convenios/${id}/`) },
}


/**
 * CONFIGURACIÓN
 */
const configuraciones = {
  create(payload) { return http.post("configuraciones/", payload) },
  list(params)    { return http.get("configuraciones/", { params }) },
}

// const valoresConfiguracion = {
//   list(params)   { return http.get('valores-configuracion/', { params }) },
//   create(payload){ return http.post('valores-configuracion/', payload) },
//   update(id,pay) { return http.patch(`valores-configuracion/${id}/`, pay) },
//   getPorEmpresa(empresaId){ return http.get(`valores-configuracion/por-empresa/${empresaId}/`) },

//   // ⬇️ Nuevo helper: upsert específico para ui.nav
//   // valor = Array del menú (objetos con {routeName,label,icon,roles?})
//   async upsertUiNav({ empresaId, valor }) {
//     // 1) asegura Configuracion 'ui.nav' (tipo json)
//     let cfgId = null
//     {
//       const { data } = await configuraciones.list({ search: 'ui.nav', page_size: 50 })
//       const rows = data?.results || data || []
//       const found = rows.find(r => r.nombre === 'ui.nav')
//       if (found) {
//         cfgId = found.id
//       } else {
//         const { data: created } = await configuraciones.create({
//           nombre: 'ui.nav',
//           tipo_dato: 'json',
//           descripcion: 'Menú de navegación por empresa',
//         })
//         cfgId = created.id
//       }
//     }

//     // 2) busca ValorConfiguracion existente para esa configuracion y empresa
//     const { data: vcData } = await valoresConfiguracion.list({ search: 'ui.nav', page_size: 50 })
//     const list = vcData?.results || vcData || []
//     const existing = list.find(r => String(r.empresa) === String(empresaId) && r.configuracion === cfgId)

//     const payload = {
//       empresa: empresaId,
//       configuracion: cfgId,
//       valor: JSON.stringify(valor), // IMPORTANTE: string JSON
//     }

//     if (existing?.id) {
//       return valoresConfiguracion.update(existing.id, payload)
//     }
//     return valoresConfiguracion.create(payload)
//   },
//     // Upsert múltiple (array de {key,value})
//   async upsertMany(empresaId, pairs){
//     for (const { key, value } of pairs){
//       const val = (typeof value === 'object') ? JSON.stringify(value) : String(value ?? '')
//       await http.post('valores-configuracion/upsert/', {
//         empresa: empresaId,
//         nombre: key,
//         valor: val,
//       })
//     }
//   },
  
// }

const valoresConfiguracion = {
  list(params)    { return http.get('valores-configuracion/', { params }) },
  create(payload) { return http.post('valores-configuracion/', payload) },
  update(id, pay) { return http.patch(`valores-configuracion/${id}/`, pay) },

  // 🔹 Carga todo el bloque ui.* por empresa (json ya parseado en los valores tipo 'json')
  getPorEmpresa(empresaId) {
    return http.get(`valores-configuracion/por-empresa/${empresaId}/`);
  },

  // 🔹 Guarda una sola clave
  upsert({ empresa, nombre, valor }) {
    return http.post('valores-configuracion/upsert/', { empresa, nombre, valor });
  },

  // 🔹 Guarda varias claves de una
  upsertMany({ empresa, items }) {
    return http.post('valores-configuracion/upsert-many/', { empresa, items });
  },

  // 🔹 Helper para crear/actualizar 'ui.nav' como JSON correctamente
  async upsertUiNav({ empresaId, valor }) {
    return this.upsert({ empresa: empresaId, nombre: 'ui.nav', valor: JSON.stringify(valor) });
  },
};



/**
 * PLANES
 */
// ...
const planes = {
  list(params) { return http.get("planes/", { params }); },
  retrieve(id,params) { return http.get(`planes/${id}/`, {  params }); },
  create(payload) { return http.post("planes/", payload); },
  update(id, payload) { return http.put(`planes/${id}/`, payload); },
  patch(id, payload) { return http.patch(`planes/${id}/`, payload); },
  delete(id) { return http.delete(`planes/${id}/`); },

  precios: {
    create(payload) { return http.post("planes/precios/", payload); },
    list(params) { return http.get("planes/precios/", { params }); },          // <- NUEVO (filtra por plan)
    delete(id) { return http.delete(`planes/precios/${id}/`); },               // <- NUEVO
  },

  restricciones: {
    create(payload) { return http.post("planes/restricciones/", payload); },
    list(params) { return http.get("planes/restricciones/", { params }); },
    retrieve(id) { return http.get(`planes/restricciones/${id}/`); },
    update(id, payload) { return http.put(`planes/restricciones/${id}/`, payload); },
    patch(id, payload) { return http.patch(`planes/restricciones/${id}/`, payload); },
    delete(id) { return http.delete(`planes/restricciones/${id}/`); },
  },
}

planes.publicarRevision = function(planId, payload = {}) {
  return http.post(`planes/${planId}/publicar-revision/`, payload);
};

planes.revisiones = {
  list(params) { return http.get("planes/revisiones/", { params }); },
  precios(params) { return http.get("planes/revisiones/precios/", { params }); },
  restricciones(params) { return http.get("planes/revisiones/restricciones/", { params }); },
  servicios(params) { return http.get("planes/revisiones/servicios/", { params }); },
  beneficios(params) { return http.get("planes/revisiones/beneficios/", { params }); },
  disciplinas(params) { return http.get("planes/revisiones/disciplinas/", { params }); },

  // helper: trae la revisión vigente más reciente a cierta fecha
  async getVigente(planId, fechaISO /* 'YYYY-MM-DD' */) {
    const { data } = await this.list({ plan: planId, vigentes_a: fechaISO, page_size: 1, ordering: "-version" });
    const arr = data?.results || data || [];
    return arr[0] || null;
  },
};
const planesRestricciones = {
  list(params){ return http.get("planes/restricciones/", { params }) },
  retrieve(id){ return http.get(`planes/restricciones/${id}/`) },
  create(payload){ return http.post("planes/restricciones/", payload) },
  update(id, payload){ return http.put(`planes/restricciones/${id}/`, payload) },
  patch(id, payload){ return http.patch(`planes/restricciones/${id}/`, payload) },
  delete(id){ return http.delete(`planes/restricciones/${id}/`) },
};
const servicios = {
  list(params){ return http.get("servicios/", { params }) },
  retrieve(id){ return http.get(`servicios/${id}/`) },
  create(payload){ return http.post("servicios/", payload) },
  update(id, payload){ return http.put(`servicios/${id}/`, payload) },
  patch(id, payload){ return http.patch(`servicios/${id}/`, payload) },
  delete(id){ return http.delete(`servicios/${id}/`) },
  
}

const beneficios = {
  list(params){ return http.get("beneficios/", { params }) },
  retrieve(id){ return http.get(`beneficios/${id}/`) },
  create(payload){ return http.post("beneficios/", payload) },
  update(id, payload){ return http.put(`beneficios/${id}/`, payload) },
  patch(id, payload){ return http.patch(`beneficios/${id}/`, payload) },
  delete(id){ return http.delete(`beneficios/${id}/`) },
}

const planesServicios = {
  list(params){ return http.get("planes/servicios/", { params }) },
  create(payload){ return http.post("planes/servicios/", payload) },
  update(id, payload){ return http.put(`planes/servicios/${id}/`, payload) },
  patch(id, payload){ return http.patch(`planes/servicios/${id}/`, payload) },
  delete(id){ return http.delete(`planes/servicios/${id}/`) },
}

const planesBeneficios = {
  list(params){ return http.get("planes/beneficios/", { params }) },
  create(payload){ return http.post("planes/beneficios/", payload) },
  update(id, payload){ return http.put(`planes/beneficios/${id}/`, payload) },
  patch(id, payload){ return http.patch(`planes/beneficios/${id}/`, payload) },
  delete(id){ return http.delete(`planes/beneficios/${id}/`) },
}
const servicioBeneficios = {
  list(params){ return http.get("servicios/beneficios/", { params }) },                  // ?servicio=ID  (opcional paginado)
  create(payload){ return http.post("servicios/beneficios/", payload) },                 // { servicio, beneficio, ... }
  update(id, payload){ return http.put(`servicios/beneficios/${id}/`, payload) },       // si decides editar vigencias/notas
  patch(id, payload){ return http.patch(`servicios/beneficios/${id}/`, payload) },
  delete(id){ return http.delete(`servicios/beneficios/${id}/`) },
};
const disciplinas = {
  list(params){ return http.get("disciplinas/", { params }) },
  retrieve(id){ return http.get(`disciplinas/${id}/`) },
  create(payload){ return http.post("disciplinas/", payload) },
  update(id, payload){ return http.put(`disciplinas/${id}/`, payload) },
  patch(id, payload){ return http.patch(`disciplinas/${id}/`, payload) },
  delete(id){ return http.delete(`disciplinas/${id}/`) },
}

const disciplinasPlanes = {
  list(params){ return http.get("disciplinas/planes/", { params }) },
  create(payload){ return http.post("disciplinas/planes/", payload) },
  update(id, payload){ return http.put(`disciplinas/planes/${id}/`, payload) },
  patch(id, payload){ return http.patch(`disciplinas/planes/${id}/`, payload) },
  delete(id){ return http.delete(`disciplinas/planes/${id}/`) },
}

const horariosDisciplinas = {
  list(params){ return http.get("disciplinas/horarios/", { params }) },
  create(payload){ return http.post("disciplinas/horarios/", payload) },
  update(id, payload){ return http.put(`disciplinas/horarios/${id}/`, payload) },
  patch(id, payload){ return http.patch(`disciplinas/horarios/${id}/`, payload) },
  delete(id){ return http.delete(`disciplinas/horarios/${id}/`) },
}

const altasPlan = {
  list(params){ return http.get("planes/altas/", { params }) },
  create(payload){ return http.post("planes/altas/", payload) },
  update(id, payload){ return http.put(`planes/altas/${id}/`, payload) },
  patch(id, payload){ return http.patch(`planes/altas/${id}/`, payload) },
  delete(id){ return http.delete(`planes/altas/${id}/`) },
}

const accesos = {
  list(params){ return http.get("accesos/", { params }) },
  resumen(params){ return http.get("accesos/resumen/", { params }) }, // <-- nuevo
  create(payload){ return http.post("accesos/", payload) },
}

// INVENTARIO
const inventario = {
  almacenes: {
    list(params){ return http.get("inventario/almacenes/", { params }) },
    retrieve(id){ return http.get(`inventario/almacenes/${id}/`) },
    create(payload){ return http.post("inventario/almacenes/", payload) },
    update(id, payload){ return http.put(`inventario/almacenes/${id}/`, payload) },
    patch(id, payload){ return http.patch(`inventario/almacenes/${id}/`, payload) },
    delete(id){ return http.delete(`inventario/almacenes/${id}/`) },
  },
    categoriasProducto: {
      list(params){ return http.get("inventario/categorias-producto/", { params }) },
      retrieve(id){ return http.get(`inventario/categorias-producto/${id}/`) },
      create(payload){ return http.post("inventario/categorias-producto/", payload) },
      update(id, payload){ return http.put(`inventario/categorias-producto/${id}/`, payload) },
      patch(id, payload){ return http.patch(`inventario/categorias-producto/${id}/`, payload) },
      delete(id){ return http.delete(`inventario/categorias-producto/${id}/`) },
    },

    categorias: {
      list(params){ return http.get("inventario/categorias-producto/", { params }) },
      retrieve(id){ return http.get(`inventario/categorias-producto/${id}/`) },
      create(payload){ return http.post("inventario/categorias-producto/", payload) },
      update(id, payload){ return http.put(`inventario/categorias-producto/${id}/`, payload) },
      patch(id, payload){ return http.patch(`inventario/categorias-producto/${id}/`, payload) },
      delete(id){ return http.delete(`inventario/categorias-producto/${id}/`) },
    },
  productos: {
    list(params){ return http.get("inventario/productos/", { params }) },
    retrieve(id){ return http.get(`inventario/productos/${id}/`) },
    create(payload){ return http.post("inventario/productos/", payload) },
    update(id, payload){ return http.put(`inventario/productos/${id}/`, payload) },
    patch(id, payload){ return http.patch(`inventario/productos/${id}/`, payload) },
    delete(id){ return http.delete(`inventario/productos/${id}/`) },
    stock(id, params){ return http.get(`inventario/productos/${id}/stock/`, { params }) },
  },
  movimientos: {
    list(params){ return http.get("inventario/movimientos-producto/", { params }) }, // ?empresa=&producto=&almacen=&fecha_after=&fecha_before=
    retrieve(id){ return http.get(`inventario/movimientos-producto/${id}/`) },
    create(payload){ return http.post("inventario/movimientos-producto/", payload) },
    update(id, payload){ return http.put(`inventario/movimientos-producto/${id}/`, payload) },
    patch(id, payload){ return http.patch(`inventario/movimientos-producto/${id}/`, payload) },
    delete(id){ return http.delete(`inventario/movimientos-producto/${id}/`) },
     entrada({ empresa, producto, destino, cantidad, nota="" }) {
      return this.create({
        empresa, producto, cantidad, nota,
        tipo: "entrada",
        almacen_origen: null,
        almacen_destino: destino
      })
    },
    salida({ empresa, producto, origen, cantidad, nota="" }) {
      return this.create({
        empresa, producto, cantidad, nota,
        tipo: "salida",
        almacen_origen: origen,
        almacen_destino: null
      })
    },
    traspaso({ empresa, producto, origen, destino, cantidad, nota="" }) {
      return this.create({
        empresa, producto, cantidad, nota,
        tipo: "traspaso",
        almacen_origen: origen,
        almacen_destino: destino
      })
    },
  },
};

// VENTAS
// const ventas = {
//   codigos: {
//     list(params){ return http.get("ventas/codigos-descuento/", { params }) },
//     retrieve(id){ return http.get(`ventas/codigos-descuento/${id}/`) },
//     create(payload){ return http.post("ventas/codigos-descuento/", payload) },
//     update(id, payload){ return http.put(`ventas/codigos-descuento/${id}/`, payload) },
//     patch(id, payload){ return http.patch(`ventas/codigos-descuento/${id}/`, payload) },
//     delete(id){ return http.delete(`ventas/codigos-descuento/${id}/`) },
//     validar(params){ return http.get("ventas/codigos-descuento/validar/", { params }) }, // empresa, codigo, (opcional) total
//     canjear(id){ return http.post(`ventas/codigos-descuento/${id}/canjear/`) },

//   },
//   ventas: {
//     list(params){ return http.get("ventas/", { params }) }, // ?empresa=&cliente=&fecha_after=&fecha_before=
//     retrieve(id){ return http.get(`ventas/${id}/`) },
//     create(payload){ return http.post("ventas/", payload) },
//     update(id, payload){ return http.put(`ventas/${id}/`, payload) },
//     patch(id, payload){ return http.patch(`ventas/${id}/`, payload) },
//     delete(id){ return http.delete(`ventas/${id}/`) },
//     posCheckout(payload){ return http.post("ventas/pos-checkout/", payload) },
//   },
//   detalles: {
//     list(params){ return http.get("ventas/detalles/", { params }) }, // ?venta=&producto=&plan=
//     retrieve(id){ return http.get(`ventas/detalles/${id}/`) },
//     create(payload){ return http.post("ventas/detalles/", payload) },
//     update(id, payload){ return http.put(`ventas/detalles/${id}/`, payload) },
//     patch(id, payload){ return http.patch(`ventas/detalles/${id}/`, payload) },
//     delete(id){ return http.delete(`ventas/detalles/${id}/`) },
//   },
// };
function buildVentasListParams({
  empresa,
  cliente,
  fechaDesde,
  fechaHasta,
  forma_pago,
  ordering = "-fecha",
  page,
  page_size,
  ...rest
} = {}) {
  const params = { ...rest };

  if (empresa != null) params.empresa = empresa;
  if (cliente != null) params.cliente = cliente;
  if (forma_pago) params.forma_pago = forma_pago;
  if (ordering) params.ordering = ordering;
  if (page) params.page = page;
  if (page_size) params.page_size = page_size;

  // Rango de fecha para DateTimeFromToRangeFilter
  const toIso = (v) => (v instanceof Date ? v.toISOString() : v);
  if (fechaDesde) params.fecha_after = toIso(fechaDesde);
  if (fechaHasta) params.fecha_before = toIso(fechaHasta);

  return params;
}

const ventas = {
  codigos: {
    list(params)        { return http.get("ventas/codigos-descuento/", { params }); },
    retrieve(id)        { return http.get(`ventas/codigos-descuento/${id}/`); },
    create(payload)     { return http.post("ventas/codigos-descuento/", payload); },
    update(id, payload) { return http.put(`ventas/codigos-descuento/${id}/`, payload); },
    patch(id, payload)  { return http.patch(`ventas/codigos-descuento/${id}/`, payload); },
    delete(id)          { return http.delete(`ventas/codigos-descuento/${id}/`); },
    validar(params)     { return http.get("ventas/codigos-descuento/validar/", { params }); }, // empresa, codigo, (opcional) total
    canjear(id)         { return http.post(`ventas/codigos-descuento/${id}/canjear/`); },
  },

  ventas: {
    // usa buildVentasListParams para mapear fecha/forma_pago y defaults
    list(params)            { return http.get("ventas/", { params: buildVentasListParams(params) }); },
    retrieve(id)            { return http.get(`ventas/${id}/`); },
    create(payload)         { return http.post("ventas/", payload); },
    update(id, payload)     { return http.put(`ventas/${id}/`, payload); },
    patch(id, payload)      { return http.patch(`ventas/${id}/`, payload); },
    delete(id)              { return http.delete(`ventas/${id}/`); },
    posCheckout(payload)    { return http.post("ventas/pos-checkout/", payload); },
  },

  detalles: {
    list(params)            { return http.get("ventas/detalles/", { params }); }, // ?venta=&producto=&plan=
    retrieve(id)            { return http.get(`ventas/detalles/${id}/`); },
    create(payload)         { return http.post("ventas/detalles/", payload); },
    update(id, payload)     { return http.put(`ventas/detalles/${id}/`, payload); },
    patch(id, payload)      { return http.patch(`ventas/detalles/${id}/`, payload); },
    delete(id)              { return http.delete(`ventas/detalles/${id}/`); },
  },

  // NUEVO: métodos de pago (ruta: ventas/metodos-pago/)
  pagos: {
    list(params)            { return http.get("ventas/metodos-pago/", { params }); }, // ?venta=&forma_pago=
    retrieve(id)            { return http.get(`ventas/metodos-pago/${id}/`); },
    create(payload)         { return http.post("ventas/metodos-pago/", payload); },
    update(id, payload)     { return http.put(`ventas/metodos-pago/${id}/`, payload); },
    patch(id, payload)      { return http.patch(`ventas/metodos-pago/${id}/`, payload); },
    delete(id)              { return http.delete(`ventas/metodos-pago/${id}/`); },
  },
};
// FINANZAS
const finanzas = {
  proveedores: {
    list(params){ return http.get("finanzas/proveedores/", { params }) },
    retrieve(id){ return http.get(`finanzas/proveedores/${id}/`) },
    create(payload){ return http.post("finanzas/proveedores/", payload) },
    update(id, payload){ return http.put(`finanzas/proveedores/${id}/`, payload) },
    patch(id, payload){ return http.patch(`finanzas/proveedores/${id}/`, payload) },
    delete(id){ return http.delete(`finanzas/proveedores/${id}/`) },
  },
  categoriasEgresos: {
    list(params){ return http.get("finanzas/categorias-egresos/", { params }) },
    retrieve(id){ return http.get(`finanzas/categorias-egresos/${id}/`) },
    create(payload){ return http.post("finanzas/categorias-egresos/", payload) },
    update(id, payload){ return http.put(`finanzas/categorias-egresos/${id}/`, payload) },
    patch(id, payload){ return http.patch(`finanzas/categorias-egresos/${id}/`, payload) },
    delete(id){ return http.delete(`finanzas/categorias-egresos/${id}/`) },
  },
  egresos: {
    list(params){ return http.get("finanzas/egresos/", { params }) }, // ?empresa=&proveedor=&categoria=&fecha_after=&fecha_before=
    retrieve(id){ return http.get(`finanzas/egresos/${id}/`) },
    create(payload){ return http.post("finanzas/egresos/", payload) },
    update(id, payload){ return http.put(`finanzas/egresos/${id}/`, payload) },
    patch(id, payload){ return http.patch(`finanzas/egresos/${id}/`, payload) },
    delete(id){ return http.delete(`finanzas/egresos/${id}/`) },
  },
};


const documentos = {
  list(params) {
    return http.get('clientes/documentos/', { params })
  },
  create(formData) {
    return http.post('clientes/documentos/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  remove(id) {
    return http.delete(`clientes/documentos/${id}/`)
  },
}

const notas = {
  list(params) {
    // ?cliente, ?prioridad, ?estado, ?search, ?page, ?page_size, ?ordering
    return http.get('clientes/notas/', { params })
  },
  create(payload) {
    // { cliente, titulo, contenido, prioridad, estado }
    return http.post('clientes/notas/', payload)
  },
  update(id, payload) {
    return http.patch(`clientes/notas/${id}/`, payload)
  },
  remove(id) {
    return http.delete(`clientes/notas/${id}/`)
  },
}


const api = {
  auth,
  accounts,
  system,
  empresas,
  sucursales,
  usuariosEmpresa,
  clientes,
  convenios,
  configuraciones,
  valoresConfiguracion,
  planes, planesRestricciones,
  servicios, beneficios, servicioBeneficios,
  planesServicios, planesBeneficios,
  disciplinas, disciplinasPlanes, horariosDisciplinas,
  altasPlan, accesos, inventario, ventas, finanzas, documentos, notas,
  // exporta helpers por si los necesitas en UI
  _helpers: { saveTokens, getTokens, clearTokens, setEmpresa: system.setEmpresa },
};

export default api;
