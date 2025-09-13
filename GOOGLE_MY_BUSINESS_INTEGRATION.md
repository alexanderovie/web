# Integración de Google My Business - Fascinante Digital

## 📋 Resumen

Esta integración permite a los usuarios conectar sus cuentas de Google My Business y obtener información detallada sobre sus ubicaciones y métricas de rendimiento.

## 🚀 Funcionalidades Implementadas

### 1. **Autenticación OAuth 2.0**

- Conexión segura con Google My Business usando `next-auth`
- Scope requerido: `https://www.googleapis.com/auth/business.manage`
- Almacenamiento seguro de tokens en Supabase
- Refresco automático de tokens expirados

### 2. **Gestión de Cuentas**

- Listado de todas las cuentas de Google My Business del usuario
- Soporte para diferentes tipos de cuenta:
  - `ORGANIZATION`: Organizaciones
  - `PERSONAL`: Cuentas personales
  - `LOCATION_GROUP`: Grupos de ubicaciones
  - `USER_GROUP`: Grupos de usuarios
- Información de verificación y estado de cada cuenta

### 3. **Gestión de Ubicaciones**

- Listado de ubicaciones por cuenta
- Información detallada de cada ubicación:
  - Título del negocio
  - ID único de ubicación
  - Métricas de rendimiento

### 4. **Métricas de Performance**

- **Clics en sitio web**: Número total de clics en el sitio web del negocio
- **Clics en llamadas**: Número total de clics en el botón de llamada
- **Datos históricos**: Métricas diarias desde 2024
- **Análisis detallado**: Top 5 días con mayor actividad

### 5. **Dashboard Interactivo**

- Vista general de todas las cuentas y ubicaciones
- Métricas agregadas en tiempo real
- Gráficos de distribución de cuentas
- Modal detallado para cada ubicación

## 🏗️ Arquitectura

### APIs Internas

#### 1. `/api/google-business/locations`

```typescript
GET / api / google - business / locations;
```

**Respuesta:**

```json
{
  "success": true,
  "accounts": [...],
  "locations": [
    {
      "accountName": "Clientes Nuevos",
      "accountType": "LOCATION_GROUP",
      "verificationState": "UNVERIFIED",
      "locations": [
        {
          "id": "6450607283398197254",
          "title": "Fascinante Digital",
          "websiteClicks": 3,
          "callClicks": 0,
          "totalClicks": 3
        }
      ],
      "totalLocations": 3,
      "totalAccountClicks": 3
    }
  ],
  "summary": {
    "totalAccounts": 5,
    "totalLocations": 3,
    "totalWebsiteClicks": 3,
    "totalCallClicks": 0,
    "totalClicks": 3,
    "accountsWithLocations": 1,
    "accountsWithoutLocations": 4
  }
}
```

#### 2. `/api/google-business/locations/[locationId]/metrics`

```typescript
GET / api / google - business / locations / 6450607283398197254 / metrics;
```

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "locationId": "6450607283398197254",
    "dateRange": {
      "start": "2024-1-1",
      "end": "2024-12-31"
    },
    "metrics": {
      "websiteClicks": {
        "total": 3,
        "dailyData": [
          { "date": "2024-10-12", "value": 1 },
          { "date": "2024-10-24", "value": 1 },
          { "date": "2024-12-12", "value": 1 }
        ]
      },
      "callClicks": {
        "total": 0,
        "dailyData": []
      }
    }
  }
}
```

### APIs de Google

#### 1. **Account Management API**

```
GET https://mybusinessaccountmanagement.googleapis.com/v1/accounts
```

#### 2. **Business Information API**

```
GET https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{accountId}/locations?readMask=name
GET https://mybusinessbusinessinformation.googleapis.com/v1/locations/{locationId}?readMask=title
```

#### 3. **Performance API**

```
GET https://businessprofileperformance.googleapis.com/v1/locations/{locationId}:fetchMultiDailyMetricsTimeSeries
```

## 📊 Casos de Uso Soportados

### 1. **Usuario con múltiples cuentas**

- ✅ 5 cuentas diferentes (Alexander Oviedo, Clientes Nuevos, Equipo de Onboarding, Fascinante Digital, Socios)
- ✅ Solo 1 cuenta con ubicaciones (Clientes Nuevos: 3 ubicaciones)
- ✅ 4 cuentas sin ubicaciones

### 2. **Usuario con múltiples ubicaciones**

- ✅ 3 ubicaciones en "Clientes Nuevos":
  - Fascinante Digital
  - Vibrance
  - Lilian Spa

### 3. **Usuario sin ubicaciones**

- ✅ Manejo de cuentas sin ubicaciones
- ✅ Mensajes informativos apropiados

### 4. **Métricas de rendimiento**

- ✅ Datos históricos desde 2024
- ✅ Clics en sitio web y llamadas
- ✅ Análisis de días con mayor actividad

## 🎨 Componentes UI

### 1. **Página Principal GBP** (`/dashboard/gbp`)

- Métricas principales en cards
- Lista detallada de cuentas y ubicaciones
- Resumen general con estadísticas
- Gráfico de distribución de cuentas

### 2. **Modal de Métricas Detalladas**

- Métricas específicas por ubicación
- Top 5 días con mayor actividad
- Resumen de actividad del período
- Datos históricos diarios

### 3. **Indicadores Visuales**

- Iconos por tipo de cuenta
- Estados de verificación con badges
- Botones de acción para ver detalles
- Loading states y manejo de errores

## 🔧 Configuración

### Variables de Entorno Requeridas

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Configuración de Google Cloud Console

1. Habilitar Google My Business API
2. Habilitar Business Profile Performance API
3. Configurar OAuth 2.0 con scope `https://www.googleapis.com/auth/business.manage`

### Base de Datos Supabase

```sql
-- Tabla para almacenar tokens de Google My Business
CREATE TABLE google_business_tokens (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  business_account_id TEXT,
  business_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Próximas Mejoras

### 1. **Métricas Adicionales**

- [ ] Búsquedas directas e indirectas
- [ ] Visualizaciones en Maps y Search
- [ ] Reseñas y calificaciones
- [ ] Fotos y posts locales

### 2. **Funcionalidades Avanzadas**

- [ ] Comparación de períodos
- [ ] Exportación de datos
- [ ] Alertas de rendimiento
- [ ] Recomendaciones de optimización

### 3. **Integración con Otras APIs**

- [ ] Google Search Console
- [ ] Google Analytics
- [ ] Google Ads

## 📝 Notas Técnicas

### Limitaciones Conocidas

1. **readMask obligatorio**: La API de Business Information requiere especificar campos exactos
2. **Métricas limitadas**: Solo WEBSITE_CLICKS y CALL_CLICKS están disponibles actualmente
3. **Duración de tokens**: Los tokens expiran en 1 hora, requieren refresco

### Mejores Prácticas

1. **Manejo de errores**: Implementado para todos los casos de error de API
2. **Caching**: Considerar implementar cache para métricas históricas
3. **Rate limiting**: Respetar límites de la API de Google
4. **Seguridad**: Tokens almacenados de forma segura en Supabase

## 🔍 Testing

### Casos de Prueba

1. ✅ Usuario con múltiples cuentas y ubicaciones
2. ✅ Usuario con cuentas sin ubicaciones
3. ✅ Token expirado
4. ✅ Error de conexión
5. ✅ Métricas con y sin datos

### Comandos de Prueba

```bash
# Probar API de ubicaciones
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://mybusinessaccountmanagement.googleapis.com/v1/accounts"

# Probar métricas de performance
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://businessprofileperformance.googleapis.com/v1/locations/LOCATION_ID:fetchMultiDailyMetricsTimeSeries?dailyMetrics=WEBSITE_CLICKS&dailyMetrics=CALL_CLICKS&dailyRange.startDate.year=2024&dailyRange.startDate.month=1&dailyRange.startDate.day=1&dailyRange.endDate.year=2024&dailyRange.endDate.month=12&dailyRange.endDate.day=31"
```

## 📞 Soporte

Para problemas técnicos o preguntas sobre la integración, contactar al equipo de desarrollo de Fascinante Digital.

---

**Versión**: 1.0.0  
**Última actualización**: Diciembre 2024  
**Desarrollado por**: Fascinante Digital
