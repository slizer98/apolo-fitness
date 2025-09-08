// src/rbac/permissions.js
export const ROLE_PERMISSIONS = {
  owner: ['*'], // todo
  gerente: [
    // clientes
    'clientes:read','clientes:create','clientes:update','clientes:delete','clientes:deactivate',
    'contacto:crud','fiscales:crud','convenios:crud','adicionales:crud','cliente-sucursal:crud',
    // planes
    'planes:read','planes:create','planes:update','planes:delete','precios:crud','restricciones:crud',
    // config / usuarios / reportes
    'config:manage','usuarios:manage','reportes:view'
  ],
  recepcionista: [
    'clientes:read','clientes:create','clientes:update','clientes:deactivate',
    'contacto:crud','fiscales:crud','convenios:crud','adicionales:crud','cliente-sucursal:crud',
    'planes:read','planes:create','planes:update', // sin delete
    'reportes:view-basic' // si quieres reportes simples
  ],
  contabilidad: [
    'clientes:read','fiscales:crud','reportes:view',
    'productos:read'
  ],
  auditor: [
    'clientes:read','planes:read','config:read','reportes:view'
  ],
};

// Helpers
export function normalizeRole(r){ return (r || '').toLowerCase(); }

export function buildAbility({ role, isSuperuser=false }) {
  if (isSuperuser) return new Set(['*']);
  const r = normalizeRole(role);
  const perms = ROLE_PERMISSIONS[r] || [];
  return new Set(perms);
}

export function can(abilitySet, perm){
  return abilitySet.has('*') || abilitySet.has(perm);
}
export function canAny(abilitySet, perms=[]){
  if (abilitySet.has('*')) return true;
  return perms.some(p => abilitySet.has(p));
}
export function canAll(abilitySet, perms=[]){
  if (abilitySet.has('*')) return true;
  return perms.every(p => abilitySet.has(p));
}
