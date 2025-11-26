import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
    const { mapLink } = await req.json()

    if (!mapLink || typeof mapLink !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid map link' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    let lat: number | null = null
    let lng: number | null = null

    // Check if it's a shortened goo.gl link
    if (mapLink.includes('goo.gl') || mapLink.includes('maps.app.goo.gl')) {
      try {
        // Follow redirect to get full URL
        const response = await fetch(mapLink, {
          redirect: 'follow',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
          },
        })
        const fullUrl = response.url

        // Parse coordinates from full URL
        const coordMatch = fullUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
        if (coordMatch) {
          lat = parseFloat(coordMatch[1])
          lng = parseFloat(coordMatch[2])
        }

        // If no coordinates in URL, try parsing from the response body
        if (lat === null || lng === null) {
          const body = await response.text()

          // Try various patterns found in Google Maps HTML
          // Pattern: [null,null,lat,lng]
          const arrayMatch = body.match(
            /\[null,null,(-?\d+\.\d+),(-?\d+\.\d+)\]/,
          )
          if (arrayMatch) {
            lat = parseFloat(arrayMatch[1])
            lng = parseFloat(arrayMatch[2])
          }

          // Pattern: center=lat,lng or center=lat%2Clng
          if (lat === null || lng === null) {
            const centerMatch = body.match(
              /center[=:](-?\d+\.\d+)[,%]2C(-?\d+\.\d+)/i,
            )
            if (centerMatch) {
              lat = parseFloat(centerMatch[1])
              lng = parseFloat(centerMatch[2])
            }
          }

          // Pattern: ll=lat,lng
          if (lat === null || lng === null) {
            const llMatch = body.match(/ll=(-?\d+\.\d+),(-?\d+\.\d+)/)
            if (llMatch) {
              lat = parseFloat(llMatch[1])
              lng = parseFloat(llMatch[2])
            }
          }

          // Pattern: @lat,lng in body
          if (lat === null || lng === null) {
            const atMatch = body.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
            if (atMatch) {
              lat = parseFloat(atMatch[1])
              lng = parseFloat(atMatch[2])
            }
          }

          // Pattern: "lat":number,"lng":number or similar JSON patterns
          if (lat === null || lng === null) {
            const jsonMatch = body.match(
              /"lat"\s*:\s*(-?\d+\.\d+)\s*,\s*"lng"\s*:\s*(-?\d+\.\d+)/,
            )
            if (jsonMatch) {
              lat = parseFloat(jsonMatch[1])
              lng = parseFloat(jsonMatch[2])
            }
          }
        }
      } catch (err) {
        console.error('Error following redirect:', err)
      }
    }

    // Try to parse coordinates from various Google Maps URL formats
    if (lat === null || lng === null) {
      // Format: @lat,lng or /lat,lng
      const coordMatch = mapLink.match(/[@/](-?\d+\.\d+),(-?\d+\.\d+)/)
      if (coordMatch) {
        lat = parseFloat(coordMatch[1])
        lng = parseFloat(coordMatch[2])
      }
    }

    // Format: !3d(lat)!4d(lng) or similar
    if (lat === null || lng === null) {
      const lat3dMatch = mapLink.match(/!3d(-?\d+\.\d+)/)
      const lng4dMatch = mapLink.match(/!4d(-?\d+\.\d+)/)
      if (lat3dMatch && lng4dMatch) {
        lat = parseFloat(lat3dMatch[1])
        lng = parseFloat(lng4dMatch[1])
      }
    }

    // Format: ?q=lat,lng
    if (lat === null || lng === null) {
      const qMatch = mapLink.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/)
      if (qMatch) {
        lat = parseFloat(qMatch[1])
        lng = parseFloat(qMatch[2])
      }
    }

    if (lat !== null && lng !== null) {
      // Validate coordinates are within reasonable bounds
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return new Response(JSON.stringify({ lat, lng, success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    return new Response(
      JSON.stringify({
        error: 'Could not extract coordinates from map link',
        lat: null,
        lng: null,
        success: false,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('Error parsing map link:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
