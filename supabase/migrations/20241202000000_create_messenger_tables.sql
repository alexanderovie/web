-- 🚀 Migración Elite: Facebook Messenger Integration
-- Fecha: 2024-12-02
-- Descripción: Tablas elite para gestión completa de mensajes de Facebook Messenger
-- Arquitectura: Escalable, robusta, con indices optimizados y constraints de seguridad

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 🗂️ Tabla de Conversaciones de Facebook Messenger
CREATE TABLE messenger_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificadores de Facebook
  psid TEXT UNIQUE NOT NULL, -- Page-Scoped ID from Facebook
  facebook_user_id TEXT,
  
  -- Información del usuario
  user_name TEXT,
  user_profile_pic TEXT,
  user_locale TEXT DEFAULT 'en_US',
  user_timezone INTEGER DEFAULT 0,
  
  -- Estado de la conversación
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked', 'spam', 'resolved')),
  is_human_handover BOOLEAN DEFAULT FALSE,
  assigned_agent_id TEXT,
  
  -- Métricas de conversación
  message_count INTEGER DEFAULT 0,
  unread_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  first_message_at TIMESTAMPTZ DEFAULT NOW(),
  response_time_avg_seconds INTEGER DEFAULT 0,
  
  -- Metadatos y contexto
  conversation_context JSONB DEFAULT '{}',
  user_metadata JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  
  -- Referral data (ads, m.me links, etc.)
  referral_source TEXT,
  referral_type TEXT,
  referral_ref TEXT,
  
  -- Timestamps y auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints de seguridad
  CONSTRAINT valid_psid_format CHECK (length(psid) > 0 AND length(psid) <= 100),
  CONSTRAINT valid_message_count CHECK (message_count >= 0),
  CONSTRAINT valid_unread_count CHECK (unread_count >= 0),
  CONSTRAINT valid_timezone CHECK (user_timezone >= -12 AND user_timezone <= 14)
);

-- 📨 Tabla de Mensajes de Facebook Messenger
CREATE TABLE messenger_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Referencias
  conversation_id UUID REFERENCES messenger_conversations(id) ON DELETE CASCADE,
  psid TEXT NOT NULL, -- Para queries rápidas sin JOIN
  
  -- Identificadores de Facebook
  facebook_message_id TEXT UNIQUE,
  
  -- Contenido del mensaje
  message_type TEXT DEFAULT 'text' CHECK (message_type IN (
    'text', 'image', 'video', 'audio', 'file', 'location', 'contact', 
    'sticker', 'quick_reply', 'postback', 'attachment', 'template',
    'carousel', 'list', 'button', 'receipt', 'airline_boarding_pass',
    'airline_checkin', 'airline_itinerary', 'airline_update'
  )),
  message_text TEXT,
  
  -- Datos estructurados
  attachments JSONB DEFAULT '[]',
  quick_reply JSONB,
  postback JSONB,
  referral JSONB,
  delivery JSONB,
  read JSONB,
  
  -- Dirección del mensaje
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  is_echo BOOLEAN DEFAULT FALSE, -- Mensaje enviado por el bot
  
  -- Estado del mensaje
  delivery_status TEXT DEFAULT 'sent' CHECK (delivery_status IN (
    'sent', 'delivered', 'read', 'failed', 'pending'
  )),
  is_processed BOOLEAN DEFAULT FALSE,
  processing_error TEXT,
  
  -- Respuesta automática
  is_auto_response BOOLEAN DEFAULT FALSE,
  ai_model_used TEXT,
  ai_confidence_score DECIMAL(3,2),
  response_time_ms INTEGER,
  
  -- Metadatos
  message_metadata JSONB DEFAULT '{}',
  user_agent TEXT,
  ip_address INET,
  
  -- Timestamps
  facebook_timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints de seguridad y validación
  CONSTRAINT valid_message_length CHECK (
    message_text IS NULL OR length(message_text) <= 2000
  ),
  CONSTRAINT valid_confidence_score CHECK (
    ai_confidence_score IS NULL OR (ai_confidence_score >= 0 AND ai_confidence_score <= 1)
  ),
  CONSTRAINT valid_response_time CHECK (
    response_time_ms IS NULL OR response_time_ms >= 0
  )
);

-- 📊 Tabla de Métricas de Facebook Messenger (para analytics elite)
CREATE TABLE messenger_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES messenger_conversations(id) ON DELETE CASCADE,
  
  -- Métricas temporales
  date_hour TIMESTAMPTZ NOT NULL, -- Agregación por hora
  
  -- Contadores de mensajes
  messages_received INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  auto_responses INTEGER DEFAULT 0,
  human_responses INTEGER DEFAULT 0,
  
  -- Métricas de rendimiento
  avg_response_time_seconds DECIMAL(10,2),
  max_response_time_seconds INTEGER,
  failed_messages INTEGER DEFAULT 0,
  
  -- Métricas de engagement
  quick_replies_used INTEGER DEFAULT 0,
  postbacks_clicked INTEGER DEFAULT 0,
  attachments_sent INTEGER DEFAULT 0,
  
  -- Métricas de IA
  ai_accuracy_score DECIMAL(3,2),
  human_handover_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint para evitar duplicados
  UNIQUE(conversation_id, date_hour)
);

-- 🔄 Tabla de Estados de Conversación (para handover protocol)
CREATE TABLE messenger_conversation_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES messenger_conversations(id) ON DELETE CASCADE,
  
  -- Estado actual
  current_state TEXT NOT NULL DEFAULT 'bot_active' CHECK (current_state IN (
    'bot_active', 'human_pending', 'human_active', 'resolved', 'escalated'
  )),
  previous_state TEXT,
  
  -- Contexto del estado
  state_data JSONB DEFAULT '{}',
  reason TEXT,
  triggered_by TEXT, -- 'user', 'bot', 'agent', 'system'
  
  -- Timestamps
  state_changed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 📝 Índices Elite para Performance Óptima
-- Índices principales para queries frecuentes
CREATE INDEX CONCURRENTLY idx_messenger_conversations_psid ON messenger_conversations(psid);
CREATE INDEX CONCURRENTLY idx_messenger_conversations_status_active ON messenger_conversations(status) WHERE status = 'active';
CREATE INDEX CONCURRENTLY idx_messenger_conversations_last_message ON messenger_conversations(last_message_at DESC);
CREATE INDEX CONCURRENTLY idx_messenger_conversations_created_at ON messenger_conversations(created_at DESC);

-- Índices para mensajes
CREATE INDEX CONCURRENTLY idx_messenger_messages_conversation_id ON messenger_messages(conversation_id);
CREATE INDEX CONCURRENTLY idx_messenger_messages_psid ON messenger_messages(psid);
CREATE INDEX CONCURRENTLY idx_messenger_messages_direction ON messenger_messages(direction);
CREATE INDEX CONCURRENTLY idx_messenger_messages_created_at ON messenger_messages(created_at DESC);
CREATE INDEX CONCURRENTLY idx_messenger_messages_facebook_timestamp ON messenger_messages(facebook_timestamp DESC);
CREATE INDEX CONCURRENTLY idx_messenger_messages_unprocessed ON messenger_messages(is_processed) WHERE is_processed = FALSE;

-- Índices para métricas (analytics)
CREATE INDEX CONCURRENTLY idx_messenger_metrics_date_hour ON messenger_metrics(date_hour DESC);
CREATE INDEX CONCURRENTLY idx_messenger_metrics_conversation_date ON messenger_metrics(conversation_id, date_hour DESC);

-- Índices para estados
CREATE INDEX CONCURRENTLY idx_messenger_states_conversation_current ON messenger_conversation_states(conversation_id, current_state);
CREATE INDEX CONCURRENTLY idx_messenger_states_active ON messenger_conversation_states(current_state) WHERE current_state IN ('bot_active', 'human_active');

-- 🔧 Triggers Elite para Automatización
-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_messenger_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_messenger_conversations_updated_at
  BEFORE UPDATE ON messenger_conversations
  FOR EACH ROW EXECUTE FUNCTION update_messenger_updated_at();

CREATE TRIGGER trigger_messenger_messages_updated_at
  BEFORE UPDATE ON messenger_messages
  FOR EACH ROW EXECUTE FUNCTION update_messenger_updated_at();

-- Trigger para actualizar contadores de conversación
CREATE OR REPLACE FUNCTION update_messenger_conversation_counters()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Actualizar contadores en la conversación
    UPDATE messenger_conversations 
    SET 
      message_count = message_count + 1,
      last_message_at = NEW.created_at,
      unread_count = CASE 
        WHEN NEW.direction = 'inbound' THEN unread_count + 1 
        ELSE unread_count 
      END
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_messenger_message_counters
  AFTER INSERT ON messenger_messages
  FOR EACH ROW EXECUTE FUNCTION update_messenger_conversation_counters();

-- 🔒 Row Level Security (RLS) Elite
-- Habilitar RLS en todas las tablas
ALTER TABLE messenger_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messenger_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE messenger_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE messenger_conversation_states ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (se pueden extender según necesidades específicas)
CREATE POLICY "Allow service role full access" ON messenger_conversations
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access" ON messenger_messages
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access" ON messenger_metrics
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access" ON messenger_conversation_states
  FOR ALL USING (auth.role() = 'service_role');

-- 📈 Función Elite para Métricas Automáticas
CREATE OR REPLACE FUNCTION aggregate_messenger_metrics()
RETURNS void AS $$
DECLARE
  current_hour TIMESTAMPTZ;
BEGIN
  -- Agregar métricas por hora
  current_hour := date_trunc('hour', NOW());
  
  INSERT INTO messenger_metrics (
    conversation_id,
    date_hour,
    messages_received,
    messages_sent,
    auto_responses,
    human_responses,
    avg_response_time_seconds,
    max_response_time_seconds,
    failed_messages
  )
  SELECT 
    conversation_id,
    current_hour,
    COUNT(*) FILTER (WHERE direction = 'inbound') as messages_received,
    COUNT(*) FILTER (WHERE direction = 'outbound') as messages_sent,
    COUNT(*) FILTER (WHERE is_auto_response = TRUE) as auto_responses,
    COUNT(*) FILTER (WHERE is_auto_response = FALSE AND direction = 'outbound') as human_responses,
    AVG(response_time_ms::DECIMAL / 1000) as avg_response_time_seconds,
    MAX(response_time_ms) as max_response_time_seconds,
    COUNT(*) FILTER (WHERE delivery_status = 'failed') as failed_messages
  FROM messenger_messages
  WHERE created_at >= current_hour - INTERVAL '1 hour'
    AND created_at < current_hour
  GROUP BY conversation_id
  ON CONFLICT (conversation_id, date_hour) DO UPDATE SET
    messages_received = EXCLUDED.messages_received,
    messages_sent = EXCLUDED.messages_sent,
    auto_responses = EXCLUDED.auto_responses,
    human_responses = EXCLUDED.human_responses,
    avg_response_time_seconds = EXCLUDED.avg_response_time_seconds,
    max_response_time_seconds = EXCLUDED.max_response_time_seconds,
    failed_messages = EXCLUDED.failed_messages;
END;
$$ language 'plpgsql';

-- 🧹 Función de Limpieza Elite (data retention)
CREATE OR REPLACE FUNCTION cleanup_old_messenger_data()
RETURNS void AS $$
BEGIN
  -- Limpiar métricas antiguas (mantener solo 90 días)
  DELETE FROM messenger_metrics 
  WHERE date_hour < NOW() - INTERVAL '90 days';
  
  -- Archivar conversaciones inactivas (más de 30 días sin actividad)
  UPDATE messenger_conversations 
  SET status = 'archived'
  WHERE status = 'active' 
    AND last_message_at < NOW() - INTERVAL '30 days';
  
  -- Limpiar estados expirados
  DELETE FROM messenger_conversation_states
  WHERE expires_at IS NOT NULL 
    AND expires_at < NOW();
END;
$$ language 'plpgsql';

-- 📋 Comentarios para documentación
COMMENT ON TABLE messenger_conversations IS 'Conversaciones de Facebook Messenger con métricas y contexto completo';
COMMENT ON TABLE messenger_messages IS 'Mensajes individuales con metadatos completos y estado de entrega';
COMMENT ON TABLE messenger_metrics IS 'Métricas agregadas por hora para analytics y reporting';
COMMENT ON TABLE messenger_conversation_states IS 'Estados de conversación para handover protocol y workflow management';

COMMENT ON COLUMN messenger_conversations.psid IS 'Page-Scoped ID único de Facebook para identificar al usuario';
COMMENT ON COLUMN messenger_messages.facebook_message_id IS 'ID único del mensaje en Facebook';
COMMENT ON COLUMN messenger_messages.direction IS 'Dirección del mensaje: inbound (usuario) o outbound (bot/agente)';
COMMENT ON COLUMN messenger_messages.ai_confidence_score IS 'Puntuación de confianza de la respuesta de IA (0.0 a 1.0)';