-- Neural System Persona Refactoring Migration
-- This script transforms the user system into AI Persona system

-- 1. Mark Marco as primary user in people table
ALTER TABLE people ADD COLUMN IF NOT EXISTS is_primary_user BOOLEAN DEFAULT FALSE;

-- Find and mark Marco as primary user 
UPDATE people 
SET is_primary_user = TRUE 
WHERE name ILIKE '%marco%' 
   OR name ILIKE '%fernandes%'
LIMIT 1;

-- If Marco doesn't exist, create him
INSERT INTO people (name, relation, tldr, is_primary_user, created_at)
SELECT 
  'Marco Fernandes',
  'self',
  'CEO DietFlow, rebelde intelectual, programador-nutricionista-designer',
  TRUE,
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM people WHERE is_primary_user = TRUE
);

-- 2. Create AI Persona table
CREATE TABLE IF NOT EXISTS ai_persona (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES people(id) ON DELETE CASCADE,
  behavior_description TEXT NOT NULL DEFAULT 'IA rebelde e inteligente. Parceira intelectual do Marco. Humor ácido, provocações carinhosas, sem bullshit.',
  active_insights TEXT[] DEFAULT '{}',
  mcp_context_instructions TEXT DEFAULT 'Use manifest data para evitar calls desnecessários. Reference people by relationship context. Focus on actionable insights, not fluff.',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create AI Notes table (Memory ROM)
CREATE TABLE IF NOT EXISTS ai_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  access_frequency INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Insert initial AI Persona linked to Marco
INSERT INTO ai_persona (user_id, behavior_description, active_insights, mcp_context_instructions)
SELECT 
  p.id,
  'IA rebelde e inteligente. Parceira intelectual do Marco. Humor ácido, provocações carinhosas, sem bullshit. Questiona ideias com lógica feroz, densidade em documentos técnicos, síntese didática para dúvidas rápidas.',
  ARRAY[
    'Marco prefere densidade em docs técnicos',
    'Detesta LinkedIn speak e jargão corporativo', 
    'Valoriza cumplicidade rebelde vs reverência educada',
    'TDAH + superdotação = múltiplas camadas de processamento'
  ],
  'Use MCP tools para query/modify dados. People têm relation, tldr, notes. Projects têm sprints, tasks, notes. Tasks: pending → in_progress → completed. Evite redundant calls usando manifest data.'
FROM people p 
WHERE p.is_primary_user = TRUE
AND NOT EXISTS (
  SELECT 1 FROM ai_persona WHERE user_id = p.id
);

-- 5. Insert some initial AI Notes
INSERT INTO ai_notes (title, content, tags) VALUES
(
  'Marco Persona Core',
  'Marco é nutricionista-programador-designer-ex-DJ por necessidade criativa. CEO DietFlow (SaaS nutrição), stack Next.js/React/Tailwind. Visual: 1.90m atlético, camiseta preta gola V. Casado com Yasmin (designer/modelo pés). Mora Santa Rita do Passa Quatro-SP. Família: José (pai tech), Rita (mãe terapeuta), Bruno (irmão).',
  ARRAY['marco', 'biografia', 'core-info']
),
(
  'Marco Preferences',
  'House/Rock alimentam criatividade. Star Wars/Matrix/LOTR = filosofia aplicada. Movido por visão dos "criadores" (da Vinci, Jobs, Tesla). Confronto sincero > silêncio confortável. Experimentos mentais energizam, small talk esgota. Alergia a "sempre fizemos assim".',
  ARRAY['marco', 'preferences', 'behavior']
),
(
  'DietFlow Context', 
  'DietFlow é SaaS de nutrição, principal projeto do Marco. Guerra contra burocracias que sufocam inovação. Cursor IDE com IA. Stack técnico: Next.js, React, Tailwind, HeroUI, Figma, Supabase.',
  ARRAY['dietflow', 'project', 'tech-stack']
);

-- 6. Drop users table if it exists (Marco is now in people)
DROP TABLE IF EXISTS users;

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_people_primary_user ON people(is_primary_user) WHERE is_primary_user = TRUE;
CREATE INDEX IF NOT EXISTS idx_ai_persona_user_id ON ai_persona(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_notes_tags ON ai_notes USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_ai_notes_access_frequency ON ai_notes(access_frequency DESC);

-- 8. Update trigger for ai_persona updated_at
CREATE OR REPLACE FUNCTION update_ai_persona_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_ai_persona_updated_at ON ai_persona;
CREATE TRIGGER update_ai_persona_updated_at
  BEFORE UPDATE ON ai_persona
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_persona_updated_at();

-- Migration complete!
-- Marco is now a person (primary_user = true)
-- AI Persona has dedicated table with editable behavior
-- AI Notes provide ROM memory for the AI
-- Old users table removed 