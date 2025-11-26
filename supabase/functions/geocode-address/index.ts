import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { address } = await req.json()

    if (!address || typeof address !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid address' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    if (!GOOGLE_MAPS_API_KEY) {
      console.error('GOOGLE_MAPS_API_KEY is not configured')
      return new Response(
        JSON.stringify({ error: 'Geocoding service not configured' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      )
    }

    // Sanitize and prepare address for geocoding
    const cleanedAddress = address.trim()

    console.log('Geocoding address with Google Maps API:', cleanedAddress)

    // Use Google Maps Geocoding API
    const encodedAddress = encodeURIComponent(cleanedAddress)
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}&language=th&region=th`

    const response = await fetch(geocodeUrl)

    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0]
      const lat = result.geometry.location.lat
      const lng = result.geometry.location.lng
      const mapLink = `https://maps.google.com/?q=${lat},${lng}`

      console.log('Geocoding successful:', {
        lat,
        lng,
        mapLink,
        formatted_address: result.formatted_address,
      })

      return new Response(
        JSON.stringify({
          lat,
          lng,
          map_link: mapLink,
          display_name: result.formatted_address,
          success: true,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    console.log(
      'No geocoding results found for address:',
      cleanedAddress,
      'Status:',
      data.status,
    )

    // Return success: false instead of error - this is a normal case
    return new Response(
      JSON.stringify({
        lat: null,
        lng: null,
        map_link: null,
        success: false,
        message: `Address could not be geocoded (${data.status})`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (err) {
    console.error('Error geocoding address:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
