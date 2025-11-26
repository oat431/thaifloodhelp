import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { embedding, threshold = 0.85 } = await req.json()

    if (!embedding || !Array.isArray(embedding)) {
      return new Response(
        JSON.stringify({ error: 'Embedding array is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Searching for similar reports with threshold:', threshold)

    // Call the find_similar_reports function
    const { data, error } = await supabase.rpc('find_similar_reports', {
      query_embedding: embedding,
      similarity_threshold: threshold,
      match_limit: 5,
    })

    if (error) {
      console.error('Error searching for duplicates:', error)
      throw error
    }

    console.log('Found', data?.length || 0, 'similar reports')

    return new Response(
      JSON.stringify({
        duplicates: data || [],
        count: data?.length || 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error in check-duplicates function:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
