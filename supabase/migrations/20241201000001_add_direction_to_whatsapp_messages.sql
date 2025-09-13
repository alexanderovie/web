-- 🚀 Migración: Agregar campo direction a whatsapp_messages
-- Fecha: 2024-12-01
-- Descripción: Agregar campo para distinguir mensajes enviados vs recibidos

-- Agregar campo direction a la tabla whatsapp_messages
ALTER TABLE whatsapp_messages 
ADD COLUMN direction TEXT DEFAULT 'inbound' CHECK (direction IN ('inbound', 'outbound'));

-- Crear índice para mejorar performance en consultas por direction
CREATE INDEX idx_whatsapp_messages_direction ON whatsapp_messages(direction);

-- Actualizar mensajes existentes para marcarlos como recibidos
UPDATE whatsapp_messages 
SET direction = 'inbound' 
WHERE direction IS NULL;

-- ✅ Comentarios de Documentación
COMMENT ON COLUMN whatsapp_messages.direction IS 'Dirección del mensaje: inbound (recibido) o outbound (enviado)'; 