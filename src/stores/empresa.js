import { defineStore } from "pinia";
import http from "@/api/http";

export const useEmpresaStore = defineStore("empresa", {
  state: () => ({
    id: Number(import.meta.env.VITE_EMPRESA_ID || 1),
    nombre: "Empresa 1",
    logoUrl: null,
    theme: {
      primary: "#C47A3B",
      secondary: "#B8692F",
      grayDark: "#3F3F46",
      grayLight: "#9CA3AF",
      textOnPrimary: "#000000",
    },
    loaded: false,
  }),

  actions: {
    async load() {
      try {
        // Si tienes endpoint:
        // const { data } = await http.get(`/empresas/${this.id}/config/`);
        // this.nombre = data.nombre;
        // this.logoUrl = data.logo;
        // this.theme = data.theme;

        this.loaded = true;
      } catch {
        this.loaded = true;
      }
    },
  },
});
