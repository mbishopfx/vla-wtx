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

// GET - List files for a client
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const stats = searchParams.get('stats')

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 })
    }

    // If stats are requested, return file statistics
    if (stats === 'true') {
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_client_file_stats', { p_client_id: clientId })

      if (statsError) {
        console.error('Error fetching file stats:', statsError)
        return NextResponse.json({ error: 'Failed to fetch file statistics' }, { status: 500 })
      }

      return NextResponse.json({ stats: statsData })
    }

    // Fetch files for the client
    const { data: files, error } = await supabase
      .from('client_files')
      .select('*')
      .eq('client_id', clientId)
      .order('upload_date', { ascending: false })

    if (error) {
      console.error('Error fetching files:', error)
      return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 })
    }

    return NextResponse.json({ files })
  } catch (error) {
    console.error('Error in GET /api/files:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Upload a new file
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const clientId = formData.get('clientId') as string
    const description = formData.get('description') as string
    const uploadedBy = formData.get('uploadedBy') as string

    if (!file || !clientId) {
      return NextResponse.json({ error: 'File and client ID are required' }, { status: 400 })
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 50MB' }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const filename = `${timestamp}_${Math.random().toString(36).substring(7)}.${fileExtension}`
    const storagePath = `${clientId}/${filename}`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('client-files')
      .upload(storagePath, buffer, {
        contentType: file.type,
        duplex: 'half'
      })

    if (uploadError) {
      console.error('Error uploading file to storage:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file to storage' }, { status: 500 })
    }

    // Save file metadata to database
    const { data: fileRecord, error: dbError } = await supabase
      .from('client_files')
      .insert({
        client_id: clientId,
        filename: filename,
        original_filename: file.name,
        file_size: file.size,
        mime_type: file.type,
        storage_path: storagePath,
        description: description || null,
        uploaded_by: uploadedBy || null
      })
      .select()
      .single()

    if (dbError) {
      console.error('Error saving file metadata:', dbError)
      // Try to clean up the uploaded file
      await supabase.storage.from('client-files').remove([storagePath])
      return NextResponse.json({ error: 'Failed to save file metadata' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      file: fileRecord,
      message: 'File uploaded successfully' 
    })
  } catch (error) {
    console.error('Error in POST /api/files:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a file
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 })
    }

    // Get file record first
    const { data: fileRecord, error: fetchError } = await supabase
      .from('client_files')
      .select('storage_path')
      .eq('id', fileId)
      .single()

    if (fetchError || !fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('client-files')
      .remove([fileRecord.storage_path])

    if (storageError) {
      console.error('Error deleting file from storage:', storageError)
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('client_files')
      .delete()
      .eq('id', fileId)

    if (dbError) {
      console.error('Error deleting file from database:', dbError)
      return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'File deleted successfully' 
    })
  } catch (error) {
    console.error('Error in DELETE /api/files:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 