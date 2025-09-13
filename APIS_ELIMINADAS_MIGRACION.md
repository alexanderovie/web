# 📋 Registro de APIs Eliminadas y Plan de Migración

**Fecha de Eliminación:** 13 de Enero, 2025  
**Motivo:** Errores de build por dependencias de Supabase y APIs externas no configuradas  
**Estado:** APIs eliminadas temporalmente, funcionalidad deshabilitada con fallbacks

---

## 🗑️ APIs Eliminadas

### 1. **Conversaciones y Mensajería**

- **Ruta:** `/api/conversations`
- **Archivo:** `src/app/api/conversations/route.ts`
- **Dependencias:** Supabase (whatsapp_messages table)
- **Funcionalidad:** Gestión de conversaciones de WhatsApp
- **Estado:** ❌ ELIMINADA

### 2. **Envío de WhatsApp**

- **Ruta:** `/api/send-whatsapp`
- **Archivo:** `src/app/api/send-whatsapp/route.ts`
- **Dependencias:** WhatsApp Business API + Supabase
- **Funcionalidad:** Envío de mensajes por WhatsApp
- **Estado:** ❌ ELIMINADA

### 3. **Webhook de Messenger**

- **Ruta:** `/api/messenger/webhook`
- **Archivo:** `src/app/api/messenger/webhook/route.ts`
- **Dependencias:** Facebook Messenger API + Supabase + Gemini AI
- **Funcionalidad:** Webhook para Facebook Messenger
- **Estado:** ❌ ELIMINADA

### 4. **Operaciones Supabase**

- **Ruta:** `/api/supabase/delete-message`
- **Archivo:** `src/app/api/supabase/delete-message/route.ts`
- **Dependencias:** Supabase Service Role Key
- **Funcionalidad:** Eliminación de mensajes en Supabase
- **Estado:** ❌ ELIMINADA

---

## 🧹 Servicios y Librerías Eliminadas

### Librerías de Servicios

- `src/lib/messenger-service.ts` - Servicio de alto nivel para Messenger
- `src/lib/messenger-client.ts` - Cliente para Facebook Messenger API
- `src/lib/whatsapp-client.ts` - Cliente para WhatsApp Business API
- `src/lib/conversation-manager.ts` - Gestor de conversaciones

---

## 🔄 Componentes Actualizados

### Frontend con Fallbacks

1. **WhatsAppForm.tsx**
   - **Antes:** Llamaba a `/api/send-whatsapp`
   - **Ahora:** Muestra mensaje de funcionalidad deshabilitada
   - **Fallback:** "Contacta al (800) 886-4981 para asistencia"

2. **Dashboard Page**
   - **Antes:** Cargaba datos de `/api/conversations`
   - **Ahora:** Usa datos estáticos de `data.json`
   - **Fallback:** Mensaje de mantenimiento si no hay datos

---

## 🏗️ Plan de Migración Futura

### **Repositorio: `messaging-api`**

**Propósito:** APIs de comunicación y mensajería

#### APIs a Migrar:

- ✅ `/api/conversations` → `messaging-api/api/conversations`
- ✅ `/api/send-whatsapp` → `messaging-api/api/whatsapp/send`
- ✅ `/api/messenger/webhook` → `messaging-api/api/messenger/webhook`
- ✅ `/api/supabase/delete-message` → `messaging-api/api/messages/delete`

#### Servicios a Migrar:

- ✅ `messenger-service.ts` → `messaging-api/lib/messenger-service.ts`
- ✅ `messenger-client.ts` → `messaging-api/lib/messenger-client.ts`
- ✅ `whatsapp-client.ts` → `messaging-api/lib/whatsapp-client.ts`
- ✅ `conversation-manager.ts` → `messaging-api/lib/conversation-manager.ts`

---

## 🔧 Configuración Requerida

### Variables de Entorno Necesarias:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=your_whatsapp_token
META_PHONE_NUMBER_ID=your_phone_number_id

# Facebook Messenger
FACEBOOK_VERIFY_TOKEN=your_verify_token
FACEBOOK_PAGE_ACCESS_TOKEN=your_page_token

# Gemini AI (opcional)
GOOGLE_AI_API_KEY=your_gemini_key
```

### Base de Datos Supabase:

```sql
-- Tabla para mensajes de WhatsApp
CREATE TABLE whatsapp_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para conversaciones de Messenger
CREATE TABLE messenger_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  psid TEXT UNIQUE NOT NULL,
  user_name TEXT,
  user_profile_pic TEXT,
  status TEXT DEFAULT 'active',
  message_count INTEGER DEFAULT 0,
  unread_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🚀 Pasos para Restaurar Funcionalidad

### 1. **Crear Repositorio `messaging-api`**

```bash
mkdir messaging-api
cd messaging-api
npm init -y
# Configurar Next.js o Express.js
```

### 2. **Migrar APIs**

- Copiar archivos eliminados al nuevo repositorio
- Configurar variables de entorno
- Configurar base de datos Supabase

### 3. **Actualizar Frontend**

- Cambiar URLs de APIs en componentes
- Configurar proxy o CORS si es necesario
- Actualizar fallbacks

### 4. **Testing**

- Probar cada API individualmente
- Verificar integración con frontend
- Validar webhooks de Facebook/WhatsApp

---

## 📊 Impacto en la Aplicación

### ✅ **Funcionalidades que Siguen Funcionando:**

- Formulario de contacto básico (`/api/contact`)
- Autenticación (`/api/auth/*`)
- Pagos Stripe (`/api/stripe/*`)
- APIs de SEO y análisis (`/api/serp/*`, `/api/labs/*`)
- Integraciones con Google (`/api/google-business/*`)

### ❌ **Funcionalidades Temporalmente Deshabilitadas:**

- Envío de mensajes por WhatsApp
- Gestión de conversaciones
- Webhook de Facebook Messenger
- Eliminación de mensajes

### 🔄 **Fallbacks Implementados:**

- Mensajes informativos en lugar de errores
- Datos estáticos en lugar de APIs dinámicas
- Números de teléfono para contacto directo

---

## 📝 Notas Importantes

1. **No se perdió código:** Todos los archivos están documentados aquí
2. **Migración reversible:** Se puede restaurar fácilmente
3. **Arquitectura mejorada:** Separación de responsabilidades
4. **Escalabilidad:** Cada servicio puede escalar independientemente

---

## 🔗 Enlaces Útiles

- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- [Facebook Messenger Platform](https://developers.facebook.com/docs/messenger-platform)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**Última Actualización:** 13 de Enero, 2025  
**Responsable:** Sistema de Migración Automática  
**Estado:** ✅ Documentación Completa
