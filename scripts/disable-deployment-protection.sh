#!/bin/bash

# =============================================================================
# SCRIPT: Desactivar Deployment Protection en Vercel (Élite)
# =============================================================================

set -euo pipefail

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
PROJECT_NAME="web"
ORG_ID="alexanderoviedo"

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Verificar dependencias
check_dependencies() {
    log "Verificando dependencias..."
    
    if ! command -v vercel &> /dev/null; then
        error "Vercel CLI no está instalado. Instala con: npm i -g vercel"
    fi
    
    if ! command -v curl &> /dev/null; then
        error "curl no está instalado"
    fi
    
    success "Dependencias verificadas"
}

# Obtener token de Vercel
get_vercel_token() {
    log "Obteniendo token de Vercel..."
    
    # Intentar obtener token desde archivo de configuración
    if [[ -f ~/.vercel/token ]]; then
        VERCEL_TOKEN=$(cat ~/.vercel/token)
        success "Token de Vercel obtenido desde archivo de configuración"
        return
    fi
    
    # Si no se puede obtener, usar el token de las variables de entorno
    if [[ -n "${VERCEL_TOKEN:-}" ]]; then
        success "Token de Vercel obtenido desde variables de entorno"
        return
    fi
    
    error "No se pudo obtener el token de Vercel. Ejecuta 'vercel login' primero"
}

# Obtener información del proyecto
get_project_info() {
    log "Obteniendo información del proyecto..."
    
    PROJECT_ID=$(vercel project inspect "$PROJECT_NAME" | grep "ID" | awk '{print $3}')
    
    if [[ -z "$PROJECT_ID" ]]; then
        error "No se pudo obtener el ID del proyecto"
    fi
    
    success "Project ID: $PROJECT_ID"
}

# Intentar desactivar Deployment Protection via API
disable_deployment_protection_api() {
    log "Intentando desactivar Deployment Protection via API..."
    
    # URL de la API de Vercel
    API_URL="https://api.vercel.com/v9/projects/$PROJECT_ID/deployment-protection"
    
    # Headers
    HEADERS=(
        -H "Authorization: Bearer $VERCEL_TOKEN"
        -H "Content-Type: application/json"
    )
    
    # Payload para desactivar protección
    PAYLOAD='{"enabled": false}'
    
    # Intentar hacer la petición
    RESPONSE=$(curl -s -X PATCH "${HEADERS[@]}" -d "$PAYLOAD" "$API_URL" || echo "API_ERROR")
    
    if [[ "$RESPONSE" == "API_ERROR" ]]; then
        warning "No se pudo desactivar via API (puede requerir permisos especiales)"
        return 1
    fi
    
    # Verificar si fue exitoso
    if echo "$RESPONSE" | grep -q "enabled.*false"; then
        success "Deployment Protection desactivado via API"
        return 0
    else
        warning "Respuesta inesperada de la API: $RESPONSE"
        return 1
    fi
}

# Configurar bypass para automatización
setup_automation_bypass() {
    log "Configurando bypass para automatización..."
    
    # URL de la API de Vercel
    API_URL="https://api.vercel.com/v9/projects/$PROJECT_ID/deployment-protection"
    
    # Headers
    HEADERS=(
        -H "Authorization: Bearer $VERCEL_TOKEN"
        -H "Content-Type: application/json"
    )
    
    # Payload para configurar bypass
    BYPASS_SECRET="github-actions-$(date +%s)"
    PAYLOAD="{\"enabled\": true, \"automationBypass\": {\"enabled\": true, \"secret\": \"$BYPASS_SECRET\"}}"
    
    # Intentar hacer la petición
    RESPONSE=$(curl -s -X PATCH "${HEADERS[@]}" -d "$PAYLOAD" "$API_URL" || echo "API_ERROR")
    
    if [[ "$RESPONSE" == "API_ERROR" ]]; then
        warning "No se pudo configurar bypass via API"
        return 1
    fi
    
    success "Bypass configurado con secret: $BYPASS_SECRET"
    
    # Guardar secret para GitHub Actions
    echo "DEPLOYMENT_PROTECTION_BYPASS_SECRET=$BYPASS_SECRET" >> .env.local
    success "Secret guardado en .env.local"
    
    return 0
}

# Mostrar instrucciones manuales
show_manual_instructions() {
    log "Mostrando instrucciones para desactivar manualmente..."
    
    echo ""
    warning "INSTRUCCIONES MANUALES PARA DEPLOYMENT PROTECTION:"
    echo ""
    echo "1. Ve a: https://vercel.com/$ORG_ID/$PROJECT_NAME/settings/deployment-protection"
    echo ""
    echo "2. Opciones disponibles:"
    echo "   a) Desactivar completamente 'Deployment Protection'"
    echo "   b) Configurar 'Bypass for Automation' con un header secreto"
    echo ""
    echo "3. Para bypass de automatización:"
    echo "   - Habilita 'Bypass for Automation'"
    echo "   - Genera un header secreto"
    echo "   - Configúralo como secret en GitHub: DEPLOYMENT_PROTECTION_BYPASS_SECRET"
    echo ""
    echo "4. Después de configurar, haz push para probar GitHub Actions"
    echo ""
}

# Función principal
main() {
    log "🚀 Desactivando Deployment Protection para Fascinante Digital (Élite)"
    
    check_dependencies
    get_vercel_token
    get_project_info
    
    # Intentar desactivar via API
    if disable_deployment_protection_api; then
        success "🎉 Deployment Protection desactivado automáticamente"
    elif setup_automation_bypass; then
        success "🎉 Bypass para automatización configurado"
    else
        warning "No se pudo configurar automáticamente"
        show_manual_instructions
    fi
    
    log "Próximos pasos:"
    log "1. Si fue manual, seguir las instrucciones mostradas"
    log "2. Hacer push a main para probar GitHub Actions"
    log "3. Verificar que los workflows funcionen correctamente"
}

# Ejecutar función principal
main "$@"
