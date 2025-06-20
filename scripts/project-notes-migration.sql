-- ====================================
-- NEURAL SYSTEM PROJECT NOTES MIGRATION
-- Execute estas queries manualmente no Supabase SQL Editor
-- ====================================

-- TAREFA 1: Criar tabela project_notes
-- ====================================

CREATE TABLE project_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index para performance
CREATE INDEX idx_project_notes_project_id ON project_notes(project_id);
CREATE INDEX idx_project_notes_tags ON project_notes USING GIN(tags);

-- TAREFA 2: Adicionar colunas de controle nos projetos
-- ====================================

-- Adicionar colunas de controle na tabela projects
ALTER TABLE projects 
ADD COLUMN is_default_project BOOLEAN DEFAULT FALSE,
ADD COLUMN is_protected BOOLEAN DEFAULT FALSE;

-- Marcar Knowledge como projeto padrão e protegido
UPDATE projects 
SET 
  name = 'Conhecimento Geral',
  is_default_project = TRUE,
  is_protected = TRUE
WHERE name = 'Knowledge';

-- Garantir que só existe um projeto padrão
CREATE UNIQUE INDEX idx_unique_default_project 
ON projects (is_default_project) 
WHERE is_default_project = TRUE;

-- ====================================
-- VERIFICAÇÃO DAS MUDANÇAS
-- ====================================

-- Verificar se a tabela project_notes foi criada
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'project_notes';

-- Verificar se as colunas foram adicionadas na tabela projects
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND column_name IN ('is_default_project', 'is_protected');

-- Verificar se o projeto Knowledge foi renomeado e configurado
SELECT id, name, is_default_project, is_protected 
FROM projects 
WHERE name = 'Conhecimento Geral';

-- ====================================
-- ROLLBACK (se necessário)
-- ====================================

-- Para desfazer as mudanças (caso necessário):
-- DROP TABLE project_notes;
-- ALTER TABLE projects DROP COLUMN is_default_project;
-- ALTER TABLE projects DROP COLUMN is_protected;
-- UPDATE projects SET name = 'Knowledge' WHERE name = 'Conhecimento Geral'; 