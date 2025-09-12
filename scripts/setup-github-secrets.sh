#!/bin/bash

# =============================================================================
# SCRIPT: Configurar GitHub Secrets para Fascinante Digital (Élite)
# =============================================================================

set -euo pipefail

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
REPO_OWNER="alexanderovie"
REPO_NAME="web"
GITHUB_TOKEN="${GITHUB_TOKEN:-}"

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
    
    if ! command -v gh &> /dev/null; then
        error "GitHub CLI (gh) no está instalado. Instala con: brew install gh"
    fi
    
    if ! command -v vercel &> /dev/null; then
        error "Vercel CLI no está instalado. Instala con: npm i -g vercel"
    fi
    
    success "Dependencias verificadas"
}

# Obtener token de Vercel
get_vercel_token() {
    log "Obteniendo token de Vercel..."
    
    # Intentar obtener token desde Vercel CLI
    if command -v vercel &> /dev/null; then
        VERCEL_TOKEN=$(vercel whoami 2>/dev/null | head -1 || echo "")
        if [[ -n "$VERCEL_TOKEN" ]]; then
            success "Token de Vercel obtenido: $VERCEL_TOKEN"
            return
        fi
    fi
    
    # Si no se puede obtener, usar el token de las variables de entorno
    if [[ -n "${VERCEL_TOKEN:-}" ]]; then
        success "Token de Vercel obtenido desde variables de entorno"
        return
    fi
    
    error "No se pudo obtener el token de Vercel"
}

# Obtener información del proyecto Vercel
get_vercel_project_info() {
    log "Obteniendo información del proyecto Vercel..."
    
    # Obtener Project ID
    VERCEL_PROJECT_ID=$(vercel project inspect web --json 2>/dev/null | jq -r '.id' || echo "prj_Xz03qkxbw4q6nBgXsUL3z5OvdSVW")
    
    # Obtener Org ID
    VERCEL_ORG_ID=$(vercel project inspect web --json 2>/dev/null | jq -r '.accountId' || echo "alexanderoviedo")
    
    success "Project ID: $VERCEL_PROJECT_ID"
    success "Org ID: $VERCEL_ORG_ID"
}

# Configurar GitHub Token
setup_github_token() {
    log "Configurando GitHub Token..."
    
    if [[ -z "$GITHUB_TOKEN" ]]; then
        warning "GITHUB_TOKEN no está configurado. Configurando GitHub CLI..."
        gh auth login --web
        GITHUB_TOKEN=$(gh auth token)
    fi
    
    success "GitHub Token configurado"
}

# Configurar secrets en GitHub
setup_github_secrets() {
    log "Configurando secrets en GitHub..."
    
    # Lista de secrets a configurar
    declare -A secrets=(
        ["VERCEL_TOKEN"]="$VERCEL_TOKEN"
        ["VERCEL_PROJECT_ID"]="$VERCEL_PROJECT_ID"
        ["VERCEL_ORG_ID"]="$VERCEL_ORG_ID"
        ["CLOUDFLARE_API_TOKEN"]="${CLOUDFLARE_API_TOKEN:-}"
        ["AWS_ACCESS_KEY_ID"]="${AWS_ACCESS_KEY_ID:-}"
        ["AWS_SECRET_ACCESS_KEY"]="${AWS_SECRET_ACCESS_KEY:-}"
    )
    
    for secret_name in "${!secrets[@]}"; do
        secret_value="${secrets[$secret_name]}"
        
        if [[ -n "$secret_value" ]]; then
            log "Configurando secret: $secret_name"
            gh secret set "$secret_name" --body "$secret_value" --repo "$REPO_OWNER/$REPO_NAME"
            success "Secret $secret_name configurado"
        else
            warning "Secret $secret_name no tiene valor, saltando..."
        fi
    done
}

# Verificar secrets configurados
verify_secrets() {
    log "Verificando secrets configurados..."
    
    gh secret list --repo "$REPO_OWNER/$REPO_NAME"
    
    success "Secrets verificados"
}

# Desactivar Deployment Protection (si es posible)
disable_deployment_protection() {
    log "Intentando desactivar Deployment Protection..."
    
    warning "Deployment Protection debe desactivarse manualmente en el dashboard de Vercel:"
    warning "1. Ve a https://vercel.com/alexanderoviedo/web/settings/deployment-protection"
    warning "2. Desactiva 'Deployment Protection'"
    warning "3. O configura 'Bypass for Automation' con un header secreto"
    
    success "Instrucciones para Deployment Protection proporcionadas"
}

# Función principal
main() {
    log "🚀 Configurando GitHub Secrets para Fascinante Digital (Élite)"
    
    check_dependencies
    get_vercel_token
    get_vercel_project_info
    setup_github_token
    setup_github_secrets
    verify_secrets
    disable_deployment_protection
    
    success "🎉 Configuración de GitHub Secrets completada"
    log "Próximos pasos:"
    log "1. Desactivar Deployment Protection en Vercel manualmente"
    log "2. Hacer push a main para probar GitHub Actions"
    log "3. Verificar que los workflows funcionen correctamente"
}

# Ejecutar función principal
main "$@"
