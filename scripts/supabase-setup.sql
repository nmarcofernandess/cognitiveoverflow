-- ================================================================
-- COGNITIVE OVERFLOW - RECURSOS VAULT SETUP
-- Script para configuração inicial do banco Supabase
-- ================================================================

-- 1. Criar a tabela recursos
CREATE TABLE IF NOT EXISTS public.recursos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('recursos', 'insights', 'docs')),
  tags TEXT[] DEFAULT '{}',
  priority TEXT NOT NULL DEFAULT 'média' CHECK (priority IN ('alta', 'média', 'baixa')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_recursos_category ON public.recursos(category);
CREATE INDEX IF NOT EXISTS idx_recursos_priority ON public.recursos(priority);
CREATE INDEX IF NOT EXISTS idx_recursos_created_at ON public.recursos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recursos_tags ON public.recursos USING GIN(tags);

-- 3. Criar índice para busca full-text em português
CREATE INDEX IF NOT EXISTS idx_recursos_search 
ON public.recursos 
USING GIN(to_tsvector('portuguese', title || ' ' || content));

-- 4. Criar função para busca avançada
CREATE OR REPLACE FUNCTION search_recursos(search_query TEXT)
RETURNS TABLE(
  id UUID,
  title TEXT,
  content TEXT,
  category TEXT,
  tags TEXT[],
  priority TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  rank REAL
)
LANGUAGE SQL
AS $$
  SELECT 
    r.id,
    r.title,
    r.content,
    r.category,
    r.tags,
    r.priority,
    r.created_at,
    r.updated_at,
    ts_rank(to_tsvector('portuguese', r.title || ' ' || r.content), plainto_tsquery('portuguese', search_query)) as rank
  FROM public.recursos r
  WHERE 
    to_tsvector('portuguese', r.title || ' ' || r.content) @@ plainto_tsquery('portuguese', search_query)
    OR r.title ILIKE '%' || search_query || '%'
    OR r.content ILIKE '%' || search_query || '%'
    OR EXISTS (
      SELECT 1 FROM unnest(r.tags) as tag 
      WHERE tag ILIKE '%' || search_query || '%'
    )
  ORDER BY rank DESC, r.created_at DESC;
$$;

-- 5. Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recursos_updated_at 
  BEFORE UPDATE ON public.recursos 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Habilitar RLS (Row Level Security) - Opcional para futuro multi-user
-- ALTER TABLE public.recursos ENABLE ROW LEVEL SECURITY;

-- 7. Inserir dados de exemplo (opcional)
INSERT INTO public.recursos (title, content, category, tags, priority) VALUES
('Exemplo de Recurso', 'Este é um recurso de exemplo para testar o sistema.', 'recursos', ARRAY['exemplo', 'teste'], 'baixa'),
('Insight Importante', 'Uma descoberta interessante sobre produtividade e foco.', 'insights', ARRAY['produtividade', 'foco'], 'alta'),
('Documentação da API', 'Guia completo para usar a API do sistema.', 'docs', ARRAY['api', 'documentação'], 'média')
ON CONFLICT DO NOTHING;

-- 8. Criar função para estatísticas
CREATE OR REPLACE FUNCTION get_recursos_stats()
RETURNS JSON
LANGUAGE SQL
AS $$
  SELECT json_build_object(
    'total', COUNT(*),
    'por_categoria', json_object_agg(category, count),
    'por_prioridade', (
      SELECT json_object_agg(priority, count) 
      FROM (
        SELECT priority, COUNT(*) as count 
        FROM public.recursos 
        GROUP BY priority
      ) p
    ),
    'ultimo_update', MAX(updated_at)
  )
  FROM (
    SELECT category, COUNT(*) as count 
    FROM public.recursos 
    GROUP BY category
  ) c;
$$;

-- ================================================================
-- INSTRUÇÕES DE USO:
-- ================================================================
-- 1. Acesse o Supabase Dashboard
-- 2. Vá em "SQL Editor"
-- 3. Cole e execute este script
-- 4. Configure as variáveis ambiente no projeto:
--    NEXT_PUBLIC_SUPABASE_URL=your_project_url
--    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
-- 5. Teste a conexão acessando /recursos
-- ================================================================ 