import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const analysisId = params.id

    if (!analysisId) {
      return NextResponse.json(
        { error: 'Analysis ID is required' },
        { status: 400 }
      )
    }

    // Delete the analysis from the database
    const { data, error } = await supabase
      .from('vla_analyses')
      .delete()
      .eq('id', analysisId)
      .select()
      .single()

    if (error) {
      console.error('Supabase delete error:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Analysis not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to delete analysis' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Analysis deleted successfully',
      deletedId: analysisId
    })

  } catch (error) {
    console.error('Delete analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to delete analysis' },
      { status: 500 }
    )
  }
} 