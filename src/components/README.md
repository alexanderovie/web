# Documentación técnica: Tipado de iconos Lucide en Feature43

## Tipado estricto de iconos

En el componente `feature43.tsx`, el objeto `iconMap` y la variable `Icon` se tipan explícitamente como `LucideIcon`, el tipo oficial exportado por `lucide-react` para todos sus íconos SVG.

```ts
import { type LucideIcon } from "lucide-react";
const iconMap: Record<string, LucideIcon> = { ... };
let Icon: LucideIcon = WandSparkles;
```

## ¿Por qué?

- Esto resuelve advertencias de ESLint y errores de TypeScript relacionados con type assertion y tipado de componentes.
- Garantiza compatibilidad estricta con los íconos SVG de Lucide y el tipado de props en React 19+.
- No afecta la lógica ni la funcionalidad del componente, solo mejora la robustez y la calidad del código.

## Impacto

- El build queda 100% limpio, sin errores de tipado ni advertencias de ESLint/Prettier.
- El código es más mantenible y seguro para futuras actualizaciones de dependencias.

---

# Patrón recomendado: Uso de `next/image` en lugar de `<img>`

## ¿Por qué migrar?

- El componente `Image` de Next.js optimiza automáticamente las imágenes para mejor rendimiento, SEO y experiencia de usuario.
- Elimina advertencias de Next.js sobre LCP y bandwidth.
- Permite imágenes responsivas, lazy loading y formatos modernos sin esfuerzo manual.

## Cómo migrar

1. Importa `Image` de `next/image` al inicio del archivo.
2. Reemplaza `<img ... />` por:
   ```tsx
   <Image
     src={...}
     alt={...}
     width={...} // Obligatorio
     height={...} // Obligatorio
     className="..." // Mantén los estilos
   />
   ```
3. Si la imagen debe ser responsiva, usa el prop `fill` y asegúrate de que el contenedor tenga `position: relative` y tamaño definido.

## Ejemplo aplicado

En `casestudy3.tsx` y `proceso-servicio.tsx`:

- Todas las etiquetas `<img>` fueron reemplazadas por `<Image />` con los props correctos y sin romper estilos ni funcionalidad.
- El build queda libre de advertencias relacionadas a imágenes.

## Recomendación

Usa siempre `Image` de Next.js para nuevas imágenes. Si tienes dudas sobre tamaños, consulta el diseño o usa valores aproximados y ajústalos tras revisar el resultado visual.
