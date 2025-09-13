-- Agregar columna 'from' a la tabla whatsapp_messages
ALTER TABLE whatsapp_messages 
ADD COLUMN IF NOT EXISTS "from" TEXT DEFAULT 'user';

-- Agregar columna session_id si no existe
ALTER TABLE whatsapp_messages 
ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Crear índice para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone_from 
ON whatsapp_messages(phone, "from");

-- Actualizar registros existentes
UPDATE whatsapp_messages 
SET "from" = 'user' 
WHERE "from" IS NULL; 