-- Create function for searching knowledge chunks with vector similarity
CREATE OR REPLACE FUNCTION search_knowledge_chunks(
  assistant_id UUID,
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  chunk_index INTEGER,
  similarity FLOAT,
  knowledge_source_name TEXT,
  knowledge_source_type TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    kc.id,
    kc.content,
    kc.chunk_index,
    1 - (kc.embedding <=> query_embedding) AS similarity,
    ks.name AS knowledge_source_name,
    ks.type AS knowledge_source_type
  FROM knowledge_chunks kc
  JOIN knowledge_sources ks ON ks.id = kc.knowledge_source_id
  JOIN assistant_knowledge ak ON ak.knowledge_source_id = ks.id
  WHERE ak.assistant_id = search_knowledge_chunks.assistant_id
    AND ks.status = 'completed'
    AND 1 - (kc.embedding <=> query_embedding) > match_threshold
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;