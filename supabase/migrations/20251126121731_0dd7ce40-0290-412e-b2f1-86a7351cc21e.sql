-- Create api_keys table for user API tokens
CREATE TABLE public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  api_key text NOT NULL UNIQUE,
  name text NOT NULL DEFAULT 'Default API Key',
  created_at timestamp with time zone DEFAULT now(),
  last_used_at timestamp with time zone,
  rate_limit_per_minute integer NOT NULL DEFAULT 60,
  is_active boolean NOT NULL DEFAULT true,
  CONSTRAINT api_keys_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Users can view their own API keys
CREATE POLICY "Users can view their own API keys"
ON public.api_keys
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own API keys
CREATE POLICY "Users can create their own API keys"
ON public.api_keys
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own API keys
CREATE POLICY "Users can update their own API keys"
ON public.api_keys
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own API keys
CREATE POLICY "Users can delete their own API keys"
ON public.api_keys
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for fast API key lookups
CREATE INDEX idx_api_keys_api_key ON public.api_keys(api_key) WHERE is_active = true;
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);

-- Create api_usage_logs table for rate limiting
CREATE TABLE public.api_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  called_at timestamp with time zone DEFAULT now(),
  success boolean NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own API usage logs
CREATE POLICY "Users can view their own API usage logs"
ON public.api_usage_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.api_keys
    WHERE api_keys.id = api_usage_logs.api_key_id
    AND api_keys.user_id = auth.uid()
  )
);

-- Create index for rate limiting queries
CREATE INDEX idx_api_usage_logs_api_key_called_at ON public.api_usage_logs(api_key_id, called_at DESC);