-- Crear tabla para estados de conversación
CREATE TABLE IF NOT EXISTS conversation_states (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) NOT NULL UNIQUE,
  state VARCHAR(50) NOT NULL DEFAULT 'INICIAL',
  last_user_message TEXT,
  last_ai_response TEXT,
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_conversation_states_phone ON conversation_states(phone);
CREATE INDEX IF NOT EXISTS idx_conversation_states_state ON conversation_states(state);
CREATE INDEX IF NOT EXISTS idx_conversation_states_updated_at ON conversation_states(updated_at);

-- Agregar comentarios para documentación
COMMENT ON TABLE conversation_states IS 'Estados de conversaciones de WhatsApp para gestión inteligente';
COMMENT ON COLUMN conversation_states.phone IS 'Número de teléfono del usuario';
COMMENT ON COLUMN conversation_states.state IS 'Estado actual de la conversación: INICIAL, INTERACTUANDO, DATOS_RECOLECTADOS, ESCALADO_A_HUMANO';
COMMENT ON COLUMN conversation_states.last_user_message IS 'Último mensaje del usuario';
COMMENT ON COLUMN conversation_states.last_ai_response IS 'Última respuesta de la IA';
COMMENT ON COLUMN conversation_states.message_count IS 'Número total de mensajes en la conversación'; 