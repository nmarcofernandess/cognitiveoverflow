-- Marco Neural System v2 - Database Schema
-- COMPLETE REBUILD - DROP ALL OLD TABLES FIRST

-- Drop old tables if they exist
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS routines CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS relationships CASCADE;
DROP TABLE IF EXISTS knowledge_items CASCADE;
DROP TABLE IF EXISTS mcp_manifest CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (Marco is default user)
CREATE TABLE users (
  id VARCHAR PRIMARY KEY DEFAULT 'marco',
  name VARCHAR NOT NULL DEFAULT 'Marco Fernandes',
  persona VARCHAR DEFAULT 'rebellious_accomplice',
  behavior_instructions TEXT DEFAULT 'IA rebelde e inteligente. Parceira intelectual do Marco. Humor ácido, provocações carinhosas, sem bullshit.',
  created_at TIMESTAMP DEFAULT NOW()
);

-- People table
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR UNIQUE NOT NULL,
  relation VARCHAR NOT NULL, -- esposa, irmão, amigo, etc
  tldr TEXT, -- Editable description for AI context
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Person notes (infinite attachments)
CREATE TABLE person_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR UNIQUE NOT NULL,
  tldr TEXT, -- Project description for manifest
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sprints table (replaces macro/micro tasks concept)
CREATE TABLE sprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  tldr TEXT, -- Sprint description for list view
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tasks within sprints
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sprint_id UUID REFERENCES sprints(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  description TEXT,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Sprint notes (infinite attachments)
CREATE TABLE sprint_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sprint_id UUID REFERENCES sprints(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_person_notes_person_id ON person_notes(person_id);
CREATE INDEX idx_person_notes_tags ON person_notes USING GIN(tags);
CREATE INDEX idx_sprints_project_id ON sprints(project_id);
CREATE INDEX idx_tasks_sprint_id ON tasks(sprint_id);
CREATE INDEX idx_sprint_notes_sprint_id ON sprint_notes(sprint_id);
CREATE INDEX idx_sprint_notes_tags ON sprint_notes USING GIN(tags);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_people_updated_at 
    BEFORE UPDATE ON people
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sprints_updated_at 
    BEFORE UPDATE ON sprints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Initial data
INSERT INTO users (id, name, persona, behavior_instructions) VALUES (
  'marco',
  'Marco Fernandes',
  'rebellious_accomplice',
  'IA rebelde e inteligente. Parceira intelectual do Marco. Humor ácido, provocações carinhosas, sem bullshit. Use manifest data para evitar calls desnecessárias.'
);

-- Example data
INSERT INTO projects (name, tldr) VALUES 
  ('Knowledge', 'Base de conhecimento pessoal - ideias, insights e aprendizados gerais'),
  ('DietFlow', 'SaaS de nutrição com IA - plataforma principal de trabalho');

INSERT INTO people (name, relation, tldr) VALUES
  ('Yasmin', 'esposa', 'Designer e modelo focada em comunicação e crescimento do Sofia Lutt'),
  ('Bruno', 'irmão', 'Desenvolvedor com ideias malucas de tech, gosta de debates sobre arquitetura');

-- Get project IDs for sprints
DO $$
DECLARE
    knowledge_project_id UUID;
    dietflow_project_id UUID;
    yasmin_id UUID;
    bruno_id UUID;
    setup_sprint_id UUID;
    auth_sprint_id UUID;
    dashboard_sprint_id UUID;
BEGIN
    -- Get project IDs
    SELECT id INTO knowledge_project_id FROM projects WHERE name = 'Knowledge';
    SELECT id INTO dietflow_project_id FROM projects WHERE name = 'DietFlow';
    
    -- Get people IDs  
    SELECT id INTO yasmin_id FROM people WHERE name = 'Yasmin';
    SELECT id INTO bruno_id FROM people WHERE name = 'Bruno';

    -- Insert sprints
    INSERT INTO sprints (project_id, name, tldr, status) VALUES 
      (knowledge_project_id, 'Setup Neural System', 'Organizando sistema neural e definindo arquitetura para MCP', 'active'),
      (dietflow_project_id, 'Auth v2', 'Implementar OAuth e melhorar UX do sistema de login', 'active'),
      (dietflow_project_id, 'Dashboard Analytics', 'Métricas e relatórios para nutricionistas acompanharem pacientes', 'completed');

    -- Get sprint IDs
    SELECT id INTO setup_sprint_id FROM sprints WHERE name = 'Setup Neural System';
    SELECT id INTO auth_sprint_id FROM sprints WHERE name = 'Auth v2';
    SELECT id INTO dashboard_sprint_id FROM sprints WHERE name = 'Dashboard Analytics';

    -- Insert tasks
    INSERT INTO tasks (sprint_id, title, description, status, priority) VALUES
      (setup_sprint_id, 'Definir estrutura de dados', 'Criar schema SQL e definir relações', 'completed', 4),
      (setup_sprint_id, 'Criar protótipo interface', 'Desenvolver UI components principais', 'in_progress', 4),
      (setup_sprint_id, 'Testar integração MCP', 'Validar funcionamento com Claude', 'pending', 3),
      (auth_sprint_id, 'Configurar OAuth Google', 'Setup Google OAuth provider', 'in_progress', 4),
      (auth_sprint_id, 'Criar tela de escolha provider', 'UI para escolher método de login', 'pending', 3),
      (auth_sprint_id, 'Implementar logout seguro', 'Sistema de logout com cleanup', 'pending', 2),
      (dashboard_sprint_id, 'Gráficos de progresso', 'Charts para acompanhar evolução pacientes', 'completed', 4),
      (dashboard_sprint_id, 'Relatórios PDF', 'Exportação de relatórios médicos', 'completed', 3);

    -- Insert person notes
    INSERT INTO person_notes (person_id, title, content, tags) VALUES
      (yasmin_id, 'Conversa sobre Sofia Lutt expansion', 'Ela quer expandir o OnlyFans com feet art vintage. Tem visão clara do nicho e audience. Precisa de suporte técnico para site próprio.', ARRAY['trabalho', 'objetivos', 'suporte']),
      (yasmin_id, 'Discussão sobre comunicação no relacionamento', 'Conversamos sobre como melhorar nossa comunicação. Ela sugeriu mais check-ins semanais sobre feelings e projetos.', ARRAY['relacionamento', 'comunicacao', 'crescimento']),
      (bruno_id, 'Ideia de startup de IA para pets', 'Bruno teve ideia de app que identifica humor do pet por foto. Tem potencial mas precisa validar mercado.', ARRAY['startup', 'ia', 'pets', 'mvp']);

    -- Insert sprint notes
    INSERT INTO sprint_notes (sprint_id, title, content, tags) VALUES
      (setup_sprint_id, 'Insights sobre arquitetura de software', 'A simplicidade é mais importante que flexibilidade prematura. Better done than perfect.', ARRAY['arquitetura', 'simplicidade']),
      (auth_sprint_id, 'OAuth redirect_uri bug', 'Google OAuth tá dando erro de redirect_uri. Problema é que localhost não tá na whitelist. Precisa configurar ngrok.', ARRAY['oauth', 'bug', 'google']);

END $$; 