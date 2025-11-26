import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

// Validate API key and check rate limit
async function validateApiKey(apiKey: string, supabase: any): Promise<{ valid: boolean; error?: string; apiKeyId?: string }> {
  if (!apiKey) {
    return { valid: false, error: 'API key is required. Please include X-API-Key header.' };
  }

  // Check if API key exists and is active
  const { data: keyData, error: keyError } = await supabase
    .from('api_keys')
    .select('id, user_id, rate_limit_per_minute, is_active')
    .eq('api_key', apiKey)
    .eq('is_active', true)
    .single();

  if (keyError || !keyData) {
    return { valid: false, error: 'Invalid or inactive API key.' };
  }

  // Check rate limit - count requests in the last minute
  const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
  const { count, error: countError } = await supabase
    .from('api_usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('api_key_id', keyData.id)
    .gte('called_at', oneMinuteAgo);

  if (countError) {
    console.error('Error checking rate limit:', countError);
    return { valid: false, error: 'Error checking rate limit.' };
  }

  if (count && count >= keyData.rate_limit_per_minute) {
    return { valid: false, error: `Rate limit exceeded. Maximum ${keyData.rate_limit_per_minute} requests per minute.` };
  }

  // Update last_used_at
  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', keyData.id);

  return { valid: true, apiKeyId: keyData.id };
}

// Log API usage
async function logApiUsage(apiKeyId: string, endpoint: string, success: boolean, supabase: any) {
  await supabase
    .from('api_usage_logs')
    .insert({
      api_key_id: apiKeyId,
      endpoint,
      success
    });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Extract API key from header
    const apiKey = req.headers.get('X-API-Key') || req.headers.get('x-api-key');
    
    // Validate API key and check rate limit
    const validation = await validateApiKey(apiKey || '', supabase);
    
    if (!validation.valid) {
      await logApiUsage(validation.apiKeyId || '', '/api/v1/save', false, supabase);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { 
          status: validation.error?.includes('Rate limit') ? 429 : 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const reportData = await req.json();

    // Validate required fields
    if (!reportData.name || !reportData.raw_message) {
      await logApiUsage(validation.apiKeyId!, '/api/v1/save', false, supabase);
      return new Response(
        JSON.stringify({ error: 'name and raw_message are required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Saving report data...');

    // Insert the report
    const { data, error } = await supabase
      .from('reports')
      .insert([reportData])
      .select()
      .single();

    if (error) {
      console.error('Error saving report:', error);
      await logApiUsage(validation.apiKeyId!, '/api/v1/save', false, supabase);
      throw error;
    }

    console.log('Report saved successfully:', data.id);
    await logApiUsage(validation.apiKeyId!, '/api/v1/save', true, supabase);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Report saved successfully',
        id: data.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in api-v1-save function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
