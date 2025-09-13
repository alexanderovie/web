-- 🚀 Script para crear tabla github_installations
-- Ejecutar en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS github_installations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  installation_id TEXT UNIQUE NOT NULL,
  account_name TEXT,
  account_type TEXT,
  setup_action TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_github_installations_user_id ON github_installations(user_id);
CREATE INDEX IF NOT EXISTS idx_github_installations_installation_id ON github_installations(installation_id);

-- RLS Policies
ALTER TABLE github_installations ENABLE ROW LEVEL SECURITY;

-- Política para que usuarios solo vean sus propias instalaciones
CREATE POLICY "Users can view own installations" ON github_installations
  FOR SELECT USING (user_id = auth.jwt() ->> 'email');

-- Política para que usuarios puedan insertar sus propias instalaciones
CREATE POLICY "Users can insert own installations" ON github_installations
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'email');

-- Política para que usuarios puedan actualizar sus propias instalaciones
CREATE POLICY "Users can update own installations" ON github_installations
  FOR UPDATE USING (user_id = auth.jwt() ->> 'email');

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_github_installations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_github_installations_updated_at
  BEFORE UPDATE ON github_installations
  FOR EACH ROW
  EXECUTE FUNCTION update_github_installations_updated_at();

