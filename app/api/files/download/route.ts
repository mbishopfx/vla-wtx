import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// GET - Download a file
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 })
    }

    // Get file metadata from database
    const { data: fileRecord, error: fetchError } = await supabase
      .from('client_files')
      .select('*')
      .eq('id', fileId)
      .single()

    if (fetchError || !fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Get signed URL for file download from Supabase Storage
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('client-files')
      .createSignedUrl(fileRecord.storage_path, 3600) // 1 hour expiry

    if (urlError || !signedUrlData) {
      console.error('Error creating signed URL:', urlError)
      return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 })
    }

    // Increment download count
    await supabase.rpc('increment_download_count', { file_id: fileId })

    // Return the signed URL for download
    return NextResponse.json({
      downloadUrl: signedUrlData.signedUrl,
      filename: fileRecord.original_filename,
      fileSize: fileRecord.file_size,
      mimeType: fileRecord.mime_type
    })
  } catch (error) {
    console.error('Error in GET /api/files/download:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Alternative direct download endpoint
export async function POST(request: NextRequest) {
  try {
    const { fileId } = await request.json()

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 })
    }

    // Get file metadata from database
    const { data: fileRecord, error: fetchError } = await supabase
      .from('client_files')
      .select('*')
      .eq('id', fileId)
      .single()

    if (fetchError || !fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('client-files')
      .download(fileRecord.storage_path)

    if (downloadError || !fileData) {
      console.error('Error downloading file:', downloadError)
      return NextResponse.json({ error: 'Failed to download file' }, { status: 500 })
    }

    // Increment download count
    await supabase.rpc('increment_download_count', { file_id: fileId })

    // Convert blob to buffer
    const buffer = Buffer.from(await fileData.arrayBuffer())

    // Return file as response with proper headers
    return new Response(buffer, {
      headers: {
        'Content-Type': fileRecord.mime_type,
        'Content-Disposition': `attachment; filename="${fileRecord.original_filename}"`,
        'Content-Length': fileRecord.file_size.toString(),
        'Cache-Control': 'no-cache'
      }
    })
  } catch (error) {
    console.error('Error in POST /api/files/download:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 