// src/composables/useThemeCssVars.js
import { watchEffect } from 'vue'

/**
 * Aplica variables CSS globales basadas en el tema actual.
 * @param {() => Object} getTheme - función que retorna el objeto tema actual (reactivo).
 *
 * Schema esperado (todas opcionales):
 * {
 *   primary, secondary,
 *   bgStart, bgEnd,       // gradiente fondo
 *   topStart, topEnd,     // gradiente topbar
 *   text,
 *   cardBg, cardText,
 *   bgMode,               // 'solid' | 'gradient'
 *   bgSolid               // color sólido del fondo
 * }
 */
export function useThemeCssVars(getTheme) {
  // No-op en SSR
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return
  }

  const root = document.documentElement

  watchEffect(() => {
    const t = (typeof getTheme === 'function' ? getTheme() : getTheme) || {}

    const bgValue =
      t.bgMode === 'solid'
        ? (t.bgSolid || '#f6f7fb')
        : `linear-gradient(120deg, ${t.bgStart || '#f6f7fb'}, ${t.bgEnd || '#f6f7fb'})`

    // Variables globales consumidas por styles.css
    setCssVar(root, '--app-bg', bgValue)
    setCssVar(root, '--app-text', t.text || '#0f172a')

    // Útiles para componentes (cards, etc.)
    setCssVar(root, '--card-bg', t.cardBg || '#ffffff')
    setCssVar(root, '--card-text', t.cardText || '#0f172a')

    // Primarios/secundarios/topbar por si los necesitas en otros lugares
    setCssVar(root, '--primary', t.primary || '#2563eb')
    setCssVar(root, '--secondary', t.secondary || '#10b981')
    setCssVar(root, '--top-start', t.topStart || '#ffffff')
    setCssVar(root, '--top-end', t.topEnd || '#ffffff')
  })
}

function setCssVar(el, name, value) {
  try {
    el.style.setProperty(name, String(value))
  } catch (e) {
    // Silencioso: evita romper la UI ante valores inválidos
    // console.debug('CSS var error', name, value, e)
  }
}

/**
 * (Opcional) Aplicar tema una sola vez de forma imperativa.
 * Útil fuera de setup() o para pruebas.
 */
export function applyThemeCssVars(themeObj = {}) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  const t = themeObj || {}
  const root = document.documentElement
  const bgValue =
    t.bgMode === 'solid'
      ? (t.bgSolid || '#f6f7fb')
      : `linear-gradient(120deg, ${t.bgStart || '#f6f7fb'}, ${t.bgEnd || '#f6f7fb'})`

  setCssVar(root, '--app-bg', bgValue)
  setCssVar(root, '--app-text', t.text || '#0f172a')
  setCssVar(root, '--card-bg', t.cardBg || '#ffffff')
  setCssVar(root, '--card-text', t.cardText || '#0f172a')
  setCssVar(root, '--primary', t.primary || '#2563eb')
  setCssVar(root, '--secondary', t.secondary || '#10b981')
  setCssVar(root, '--top-start', t.topStart || '#ffffff')
  setCssVar(root, '--top-end', t.topEnd || '#ffffff')
}
