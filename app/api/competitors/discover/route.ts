import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface GooglePlaceResult {
  place_id: string
  name: string
  rating?: number
  user_ratings_total?: number
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  vicinity?: string
  formatted_address?: string
  business_status?: string
  types: string[]
  photos?: Array<{
    height: number
    width: number
    photo_reference: string
  }>
}

interface CompetitorDiscoveryRequest {
  zipCode: string
  clientId: string
  radiusMiles?: number
  businessTypes?: string[]
}

// Function to get coordinates from zip code
async function getCoordinatesFromZipCode(zipCode: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${process.env.GOOGLE_API_KEY}`
    )
    const data = await response.json()
    
    if (data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location
      return { lat: location.lat, lng: location.lng }
    }
    return null
  } catch (error) {
    console.error('Error geocoding zip code:', error)
    return null
  }
}

// Function to search for competitors using Google Places API
async function searchCompetitors(
  lat: number,
  lng: number,
  radiusMeters: number,
  businessTypes: string[]
): Promise<GooglePlaceResult[]> {
  const competitors: GooglePlaceResult[] = []
  
  // Search for different types of auto businesses
  const searchQueries = [
    'car dealer',
    'used car dealer',
    'auto dealer',
    'automotive dealer',
    'car dealership',
    'vehicle sales'
  ]
  
  for (const query of searchQueries) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusMeters}&keyword=${encodeURIComponent(query)}&type=car_dealer&key=${process.env.GOOGLE_API_KEY}`
      )
      const data = await response.json()
      
      if (data.results) {
        competitors.push(...data.results)
      }
      
      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      console.error(`Error searching for ${query}:`, error)
    }
  }
  
  // Remove duplicates based on place_id
  const uniqueCompetitors = competitors.filter((competitor, index, self) =>
    index === self.findIndex(c => c.place_id === competitor.place_id)
  )
  
  return uniqueCompetitors
}

// Function to get additional place details
async function getPlaceDetails(placeId: string): Promise<any> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,photos,reviews,opening_hours,business_status&key=${process.env.GOOGLE_API_KEY}`
    )
    const data = await response.json()
    return data.result
  } catch (error) {
    console.error('Error getting place details:', error)
    return null
  }
}

// Function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export async function POST(request: NextRequest) {
  try {
    const body: CompetitorDiscoveryRequest = await request.json()
    const { zipCode, clientId, radiusMiles = 25, businessTypes = ['car_dealer'] } = body

    // Validate required fields
    if (!zipCode || !clientId) {
      return NextResponse.json(
        { error: 'Missing required fields: zipCode and clientId' },
        { status: 400 }
      )
    }

    // Get coordinates from zip code
    const coordinates = await getCoordinatesFromZipCode(zipCode)
    if (!coordinates) {
      return NextResponse.json(
        { error: 'Could not geocode zip code' },
        { status: 400 }
      )
    }

    // Convert radius from miles to meters
    const radiusMeters = radiusMiles * 1609.34

    // Search for competitors
    const competitors = await searchCompetitors(
      coordinates.lat,
      coordinates.lng,
      radiusMeters,
      businessTypes
    )

    // Process and save competitors to database
    const savedCompetitors = []
    
    for (const competitor of competitors.slice(0, parseInt(process.env.MAX_COMPETITORS_PER_SEARCH || '50'))) {
      try {
        // Get detailed information
        const details = await getPlaceDetails(competitor.place_id)
        
        // Calculate distance from client location
        const distance = calculateDistance(
          coordinates.lat,
          coordinates.lng,
          competitor.geometry.location.lat,
          competitor.geometry.location.lng
        )

        // Check if competitor already exists
        const { data: existingCompetitor } = await supabase
          .from('competitors')
          .select('id')
          .eq('google_place_id', competitor.place_id)
          .eq('client_id', clientId)
          .single()

        if (!existingCompetitor) {
          // Insert new competitor
          const { data: newCompetitor, error } = await supabase
            .from('competitors')
            .insert({
              client_id: clientId,
              name: competitor.name,
              google_place_id: competitor.place_id,
              google_business_name: competitor.name,
              google_rating: competitor.rating || null,
              google_review_count: competitor.user_ratings_total || null,
              google_photos_count: competitor.photos?.length || 0,
              address: details?.formatted_address || competitor.vicinity,
              latitude: competitor.geometry.location.lat,
              longitude: competitor.geometry.location.lng,
              distance_from_client: Math.round(distance * 100) / 100,
              phone: details?.formatted_phone_number || null,
              website_url: details?.website || null,
              business_type: 'local',
              discovered_via: 'google_api',
              priority_level: distance <= 10 ? 'high' : distance <= 20 ? 'medium' : 'low',
                             threat_level: (competitor.rating && competitor.rating >= 4.0) ? 'high' : (competitor.rating && competitor.rating >= 3.5) ? 'medium' : 'low'
            })
            .select()
            .single()

          if (!error && newCompetitor) {
            savedCompetitors.push({
              ...newCompetitor,
              details: details
            })
          }
        } else {
          // Update existing competitor with fresh data
          const { data: updatedCompetitor, error } = await supabase
            .from('competitors')
            .update({
              google_rating: competitor.rating || null,
              google_review_count: competitor.user_ratings_total || null,
              google_photos_count: competitor.photos?.length || 0,
              distance_from_client: Math.round(distance * 100) / 100,
              phone: details?.formatted_phone_number || null,
              website_url: details?.website || null,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingCompetitor.id)
            .select()
            .single()

          if (!error && updatedCompetitor) {
            savedCompetitors.push({
              ...updatedCompetitor,
              details: details
            })
          }
        }

        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (error) {
        console.error('Error processing competitor:', error)
      }
    }

    // Create market analysis record
    const { data: marketAnalysis } = await supabase
      .from('market_analysis')
      .insert({
        client_id: clientId,
        analysis_name: `Auto Competitor Discovery - ${zipCode}`,
        zip_code: zipCode,
        radius_miles: radiusMiles,
        total_competitors_found: competitors.length,
        market_density: competitors.length > 20 ? 'high' : competitors.length > 10 ? 'medium' : 'low',
        average_competitor_rating: competitors.reduce((sum, c) => sum + (c.rating || 0), 0) / competitors.filter(c => c.rating).length,
        data_sources: ['google_places'],
        data_quality_score: 85
      })
      .select()
      .single()

    return NextResponse.json({
      success: true,
      competitors: savedCompetitors,
      marketAnalysis: marketAnalysis,
      searchMetadata: {
        zipCode,
        coordinates,
        radiusMiles,
        totalFound: competitors.length,
        savedCount: savedCompetitors.length
      }
    })

  } catch (error) {
    console.error('Error in competitor discovery:', error)
    return NextResponse.json(
      { error: 'Internal server error during competitor discovery' },
      { status: 500 }
    )
  }
} 