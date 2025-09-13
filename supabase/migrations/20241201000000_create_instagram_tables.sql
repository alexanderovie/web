-- 🚀 Migración Elite: Instagram Business Integration
-- Fecha: 2024-12-01
-- Descripción: Tablas para gestión completa de mensajes de Instagram

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 🗂️ Tabla de Conversaciones de Instagram
CREATE TABLE instagram_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id TEXT UNIQUE NOT NULL,
  sender_name TEXT,
  sender_username TEXT,
  profile_picture_url TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  unread_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked', 'spam')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 📨 Tabla de Mensajes de Instagram
CREATE TABLE instagram_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES instagram_conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  instagram_message_id TEXT UNIQUE,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'audio', 'file', 'location', 'contact', 'sticker')),
  message_text TEXT,
  attachments JSONB DEFAULT '[]',
  is_from_business BOOLEAN DEFAULT FALSE,
  is_read BOOLEAN DEFAULT FALSE,
  is_responded BOOLEAN DEFAULT FALSE,
  response_text TEXT,
  response_timestamp TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 📊 Tabla de Métricas de Instagram
CREATE TABLE instagram_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  total_messages INTEGER DEFAULT 0,
  messages_received INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  response_time_avg INTEGER DEFAULT 0, -- en segundos
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  active_conversations INTEGER DEFAULT 0,
  new_conversations INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date)
);

-- 🔧 Tabla de Configuración de Respuestas Automáticas
CREATE TABLE instagram_auto_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('keyword', 'first_message', 'after_hours', 'default')),
  trigger_value TEXT, -- palabra clave o condición
  response_text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 🎯 Índices Elite para Performance
CREATE INDEX idx_instagram_messages_conversation_id ON instagram_messages(conversation_id);
CREATE INDEX idx_instagram_messages_created_at ON instagram_messages(created_at DESC);
CREATE INDEX idx_instagram_messages_sender_id ON instagram_messages(sender_id);
CREATE INDEX idx_instagram_messages_is_read ON instagram_messages(is_read);
CREATE INDEX idx_instagram_conversations_last_message_at ON instagram_conversations(last_message_at DESC);
CREATE INDEX idx_instagram_conversations_status ON instagram_conversations(status);
CREATE INDEX idx_instagram_metrics_date ON instagram_metrics(date DESC);

-- 🔒 Row Level Security (RLS) Elite
ALTER TABLE instagram_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_auto_responses ENABLE ROW LEVEL SECURITY;

-- 📋 Políticas RLS Elite
CREATE POLICY "Instagram conversations are viewable by authenticated users" ON instagram_conversations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Instagram messages are viewable by authenticated users" ON instagram_messages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Instagram metrics are viewable by authenticated users" ON instagram_metrics
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Instagram auto responses are viewable by authenticated users" ON instagram_auto_responses
  FOR SELECT USING (auth.role() = 'authenticated');

-- 🔄 Triggers Elite para Auto-updates
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE instagram_conversations 
  SET 
    last_message_at = NEW.created_at,
    message_count = message_count + 1,
    unread_count = CASE 
      WHEN NEW.is_from_business = FALSE THEN unread_count + 1 
      ELSE unread_count 
    END,
    updated_at = NOW()
  WHERE sender_id = NEW.sender_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON instagram_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- 📈 Función Elite para Métricas
CREATE OR REPLACE FUNCTION update_daily_metrics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO instagram_metrics (date, total_messages, messages_received, messages_sent)
  VALUES (
    CURRENT_DATE,
    (SELECT COUNT(*) FROM instagram_messages WHERE DATE(created_at) = CURRENT_DATE),
    (SELECT COUNT(*) FROM instagram_messages WHERE DATE(created_at) = CURRENT_DATE AND is_from_business = FALSE),
    (SELECT COUNT(*) FROM instagram_messages WHERE DATE(created_at) = CURRENT_DATE AND is_from_business = TRUE)
  )
  ON CONFLICT (date) DO UPDATE SET
    total_messages = EXCLUDED.total_messages,
    messages_received = EXCLUDED.messages_received,
    messages_sent = EXCLUDED.messages_sent,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 🔄 Trigger para Métricas Diarias
CREATE TRIGGER update_daily_metrics_trigger
  AFTER INSERT ON instagram_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_metrics();

-- 🎯 Datos Iniciales Elite
INSERT INTO instagram_auto_responses (trigger_type, trigger_value, response_text, priority) VALUES
('first_message', NULL, '¡Hola! Gracias por contactarnos. ¿En qué podemos ayudarte hoy?', 1),
('keyword', 'precio', 'Te ayudo con información sobre nuestros precios. ¿Qué servicio te interesa?', 2),
('keyword', 'horario', 'Nuestro horario de atención es de lunes a viernes de 9:00 AM a 6:00 PM.', 2),
('after_hours', NULL, 'Gracias por tu mensaje. Te responderemos mañana en horario de atención.', 3),
('default', NULL, 'Gracias por contactarnos. Un agente te responderá pronto.', 4);

-- ✅ Comentarios de Documentación
COMMENT ON TABLE instagram_conversations IS 'Conversaciones de Instagram Business con clientes';
COMMENT ON TABLE instagram_messages IS 'Mensajes individuales de Instagram';
COMMENT ON TABLE instagram_metrics IS 'Métricas diarias de Instagram Business';
COMMENT ON TABLE instagram_auto_responses IS 'Configuración de respuestas automáticas'; 