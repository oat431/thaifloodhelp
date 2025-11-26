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
    const {
      query,
      urgencyFilter = null,
      limit = 100,
      forceSemanticSearch = false,
    } = await req.json()

    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Search query is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Searching for:', query, 'Force semantic:', forceSemanticSearch)

    // Skip text search if forceSemanticSearch is true
    if (!forceSemanticSearch) {
      // First, try exact/partial text search on key fields (phone, name, address)
      let textSearchQuery = supabase
        .from('reports')
        .select('*')
        .or(
          `name.ilike.%${query}%,lastname.ilike.%${query}%,address.ilike.%${query}%,reporter_name.ilike.%${query}%,phone.cs.{${query}},health_condition.ilike.%${query}%,help_needed.ilike.%${query}%,additional_info.ilike.%${query}%`,
        )

      if (urgencyFilter !== null) {
        textSearchQuery = textSearchQuery.eq('urgency_level', urgencyFilter)
      }

      const { data: textResults, error: textError } = await textSearchQuery
        .order('updated_at', { ascending: false })
        .limit(limit)

      if (textError) {
        console.error('Text search error:', textError)
        // Don't throw, just log and continue to semantic search
      }

      console.log('Text search found', textResults?.length || 0, 'results')

      // If we found exact matches, return them immediately
      if (textResults && textResults.length > 0) {
        return new Response(
          JSON.stringify({
            reports: textResults,
            count: textResults.length,
            searchType: 'exact',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }
    }

    // If no exact matches, fall back to semantic vector search
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    if (!GEMINI_API_KEY) {
      // Return empty results if no API key and no text matches
      return new Response(
        JSON.stringify({
          reports: [],
          count: 0,
          searchType: 'none',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    console.log('No exact matches, performing semantic search...')

    // Generate embedding for search query
    const embeddingResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'models/text-embedding-004',
          content: {
            parts: [
              {
                text: query,
              },
            ],
          },
        }),
      },
    )

    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text()
      console.error('Gemini API error:', embeddingResponse.status, errorText)
      throw new Error(`Gemini API error: ${embeddingResponse.status}`)
    }

    const embeddingData = await embeddingResponse.json()
    const queryEmbedding = embeddingData.embedding.values

    console.log(
      'Generated search embedding with',
      queryEmbedding.length,
      'dimensions',
    )

    // Use moderate similarity threshold (0.5) for better quality results
    const { data: similarReports, error: searchError } = await supabase.rpc(
      'find_similar_reports',
      {
        query_embedding: queryEmbedding,
        similarity_threshold: 0.5,
        match_limit: limit,
      },
    )

    if (searchError) {
      console.error('Error searching reports:', searchError)
      throw searchError
    }

    console.log(
      'Semantic search found',
      similarReports?.length || 0,
      'similar reports',
    )

    // Get full report details for the similar reports
    const reportIds = similarReports?.map((r: any) => r.id) || []

    let fullReportsQuery = supabase
      .from('reports')
      .select('*')
      .in('id', reportIds)

    // Apply urgency filter if provided
    if (urgencyFilter !== null) {
      fullReportsQuery = fullReportsQuery.eq('urgency_level', urgencyFilter)
    }

    const { data: fullReports, error: reportsError } = await fullReportsQuery

    if (reportsError) {
      console.error('Error fetching full reports:', reportsError)
      throw reportsError
    }

    // Sort by similarity (using the order from similarReports)
    const sortedReports = reportIds
      .map((id: string) => fullReports?.find((r: any) => r.id === id))
      .filter((r: any) => r !== undefined)

    return new Response(
      JSON.stringify({
        reports: sortedReports,
        count: sortedReports.length,
        searchType: 'semantic',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error in search-reports function:', error)
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
