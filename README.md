# 🌐 Web Fascinante Digital

> **Sitio web público de Fascinante Digital** - Next.js 15 + TypeScript + ShadCN UI

## 🎯 Descripción

Sitio web público y marketing de Fascinante Digital, construido con las tecnologías más modernas para ofrecer una experiencia de usuario excepcional.

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS v4
- **UI Components**: ShadCN UI
- **Gestor de paquetes**: pnpm
- **Linting**: ESLint + Prettier
- **Deployment**: Vercel

## 🚀 Comandos de Desarrollo

```bash
# Instalar dependencias
pnpm install

# Ejecutar en desarrollo
pnpm dev

# Construir para producción
pnpm build

# Ejecutar en producción
pnpm start

# Linting
pnpm lint

# Linting con corrección automática
pnpm lint:fix
```

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout raíz
│   └── page.tsx           # Página principal
├── components/            # Componentes reutilizables
│   └── ui/               # Componentes de ShadCN UI
├── lib/                  # Utilidades y configuraciones
│   └── utils.ts          # Funciones utilitarias
└── types/                # Definiciones de tipos TypeScript
```

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env.local` con las siguientes variables:

```env
# Analytics
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"

# Contacto
NEXT_PUBLIC_CONTACT_EMAIL="info@fascinantedigital.com"

# Redes sociales
NEXT_PUBLIC_TWITTER_URL="https://twitter.com/fascinantedigital"
NEXT_PUBLIC_LINKEDIN_URL="https://linkedin.com/company/fascinantedigital"

# APIs externas
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
```

## 🚀 Deployment

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Deploy automático en cada push a `main`

### Docker

```bash
# Construir imagen
docker build -t web-fascinante-digital .

# Ejecutar contenedor
docker run -p 3000:3000 web-fascinante-digital
```

## 📋 Características

- ✅ **Next.js 15** con App Router
- ✅ **TypeScript** para type safety
- ✅ **Tailwind CSS v4** para estilos
- ✅ **ShadCN UI** para componentes
- ✅ **ESLint + Prettier** para calidad de código
- ✅ **Responsive Design** mobile-first
- ✅ **SEO optimizado**
- ✅ **Performance optimizado**
- ✅ **Analytics integrado**
- ✅ **Formularios de contacto**

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**Desarrollado con ❤️ por el equipo de Fascinante Digital**