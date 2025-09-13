/**
 * Sistema de colores para categorías del blog
 * Basado en psicología del color y UX/UI best practices
 */

export interface CategoryColor {
  bg: string;
  text: string;
  border: string;
  hover: string;
  badge: string;
}

export const categoryColors: Record<string, CategoryColor> = {
  "SEO Local": {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    hover: "hover:bg-blue-100",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
  },
  SEO: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    hover: "hover:bg-sky-100",
    badge: "bg-sky-100 text-sky-700 border-sky-200",
  },
  Automatización: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    hover: "hover:bg-emerald-100",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  "Google Ads": {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    hover: "hover:bg-orange-100",
    badge: "bg-orange-100 text-orange-700 border-orange-200",
  },
  "Facebook Ads": {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    hover: "hover:bg-blue-100",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
  },
  "Redes Sociales": {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    hover: "hover:bg-purple-100",
    badge: "bg-purple-100 text-purple-700 border-purple-200",
  },
  "Desarrollo Web": {
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
    hover: "hover:bg-cyan-100",
    badge: "bg-cyan-100 text-cyan-700 border-cyan-200",
  },
  Integración: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    hover: "hover:bg-indigo-100",
    badge: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
  "Marketing Digital": {
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
    hover: "hover:bg-teal-100",
    badge: "bg-teal-100 text-teal-700 border-teal-200",
  },
  Analytics: {
    bg: "bg-lime-50",
    text: "text-lime-700",
    border: "border-lime-200",
    hover: "hover:bg-lime-100",
    badge: "bg-lime-100 text-lime-700 border-lime-200",
  },
};

/**
 * Obtiene los colores para una categoría específica
 * Si la categoría no existe, usa un color por defecto
 */
export const getCategoryColors = (category: string): CategoryColor => {
  return (
    categoryColors[category] || {
      bg: "bg-slate-50",
      text: "text-slate-700",
      border: "border-slate-200",
      hover: "hover:bg-slate-100",
      badge: "bg-slate-100 text-slate-700 border-slate-200",
    }
  );
};

/**
 * Obtiene solo el color de fondo para una categoría
 */
export const getCategoryBg = (category: string): string => {
  return getCategoryColors(category).bg;
};

/**
 * Obtiene solo el color de texto para una categoría
 */
export const getCategoryText = (category: string): string => {
  return getCategoryColors(category).text;
};

/**
 * Obtiene solo el estilo de badge para una categoría
 */
export const getCategoryBadge = (category: string): string => {
  return getCategoryColors(category).badge;
};
