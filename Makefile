# ===========================================
# Web Fascinante Digital - Makefile
# ===========================================

.PHONY: help install dev build start lint lint:fix test clean docker-build docker-run docker-stop

# Variables
APP_NAME = web-fascinante-digital
DOCKER_IMAGE = $(APP_NAME):latest
DOCKER_CONTAINER = $(APP_NAME)-container

# Help
help: ## Mostrar ayuda
	@echo "Comandos disponibles para $(APP_NAME):"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Desarrollo
install: ## Instalar dependencias
	pnpm install

dev: ## Ejecutar en modo desarrollo
	pnpm dev

build: ## Construir para producción
	pnpm build

start: ## Ejecutar en producción
	pnpm start

# Linting
lint: ## Ejecutar linter
	pnpm lint

lint:fix: ## Corregir errores de linting automáticamente
	pnpm lint:fix

# Testing
test: ## Ejecutar tests
	pnpm test

# Limpieza
clean: ## Limpiar archivos generados
	rm -rf .next
	rm -rf node_modules
	rm -rf dist

# Docker
docker-build: ## Construir imagen Docker
	docker build -t $(DOCKER_IMAGE) .

docker-run: ## Ejecutar contenedor Docker
	docker run -d --name $(DOCKER_CONTAINER) -p 3000:3000 $(DOCKER_IMAGE)

docker-stop: ## Detener contenedor Docker
	docker stop $(DOCKER_CONTAINER) || true
	docker rm $(DOCKER_CONTAINER) || true

# Desarrollo completo
setup: install ## Configurar proyecto completo
	@echo "✅ Proyecto configurado correctamente"
	@echo "🚀 Ejecuta 'make dev' para comenzar el desarrollo"

# CI/CD
ci: lint test build ## Ejecutar pipeline de CI
	@echo "✅ Pipeline de CI completado exitosamente"
