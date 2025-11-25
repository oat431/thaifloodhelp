-- Update vector column to support 768 dimensions for Gemini embeddings
ALTER TABLE public.reports 
ALTER COLUMN embedding TYPE vector(768);