# Files Tool Setup Guide

This guide explains how to set up the Files tool for secure client file management in your VLA Dashboard.

## Prerequisites

- Supabase project configured
- Database tables from previous SQL exports already installed
- Admin access to Supabase dashboard

## Step 1: Create Database Tables

Execute the SQL file to create the necessary database tables and functions:

```bash
# Run this SQL in your Supabase SQL Editor
./sql-exports/13_files_storage_system.sql
```

This creates:
- `client_files` table for file metadata
- Row Level Security (RLS) policies
- Functions for file statistics and download tracking
- Proper indexes for performance

## Step 2: Create Storage Bucket

1. **Go to Supabase Dashboard** → **Storage** → **Buckets**

2. **Click "New Bucket"**
   - Bucket name: `client-files`
   - Public bucket: **NO** (keep it private)
   - File size limit: `50MB` (or your preferred limit)
   - Allowed MIME types: Leave empty for all types

3. **Click "Create Bucket"**

## Step 3: Set Up Storage Policies

In the Supabase SQL Editor, run these storage policies:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'client-files' AND auth.role() = 'authenticated');

-- Allow users to view files
CREATE POLICY "Users can view client files" ON storage.objects
  FOR SELECT USING (bucket_id = 'client-files');

-- Allow users to update files
CREATE POLICY "Users can update files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'client-files' AND auth.role() = 'authenticated');

-- Allow users to delete files
CREATE POLICY "Users can delete files" ON storage.objects
  FOR DELETE USING (bucket_id = 'client-files' AND auth.role() = 'authenticated');
```

## Step 4: Verify Environment Variables

Make sure your `.env.local` file has:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Step 5: Test the Files Tool

1. **Access the Files tool**: `http://localhost:3000/dashboard/tools/files`

2. **Select a client** from the dropdown

3. **Upload a test file**:
   - Click "Upload Files"
   - Select one or more files (up to 50MB each)
   - Add an optional description
   - Click "Select Files"

4. **Download the file**:
   - Click the download icon next to any file
   - File should download with proper filename

5. **Check file statistics** in the dashboard cards

## Supported File Types

The Files tool supports all file types, with special icons for:
- **Images**: `.jpg`, `.png`, `.gif`, `.svg`, etc.
- **Videos**: `.mp4`, `.avi`, `.mov`, etc.
- **Audio**: `.mp3`, `.wav`, `.flac`, etc.
- **Documents**: `.pdf`, `.doc`, `.docx`, `.txt`, etc.
- **Archives**: `.zip`, `.tar`, `.gz`, etc.

## Features

### ✅ **Upload Features**
- Multi-file upload support
- Drag & drop interface
- File size validation (50MB limit)
- Progress tracking
- Automatic file organization by client

### ✅ **Download Features**
- Secure signed URLs (1-hour expiry)
- Download count tracking
- Original filename preservation
- Proper MIME type handling

### ✅ **Management Features**
- File search and filtering
- Grid/List view modes
- File statistics dashboard
- Bulk operations support
- Client-based access control

### ✅ **Security Features**
- Row Level Security (RLS)
- Client-based file isolation
- Authenticated access only
- Secure file storage
- Download tracking

## Troubleshooting

### Issue: "Failed to upload file to storage"
- **Solution**: Check that the `client-files` bucket exists in Supabase Storage
- **Solution**: Verify storage policies are properly configured

### Issue: "Failed to fetch files"
- **Solution**: Ensure the `client_files` table exists in your database
- **Solution**: Check that your service role key has proper permissions

### Issue: "File not found" during download
- **Solution**: Verify the file exists in both the database and storage bucket
- **Solution**: Check that the storage path matches between database and storage

### Issue: Files not showing for client
- **Solution**: Ensure RLS policies are properly configured
- **Solution**: Check that the client ID is valid in the `clients` table

## API Endpoints

The Files tool uses these API endpoints:

- `GET /api/files?clientId={id}` - List files for client
- `GET /api/files?clientId={id}&stats=true` - Get file statistics
- `POST /api/files` - Upload new file
- `DELETE /api/files?fileId={id}` - Delete file
- `GET /api/files/download?fileId={id}` - Get download URL

## Database Schema

The `client_files` table includes these key fields:

```sql
- id (UUID) - Primary key
- client_id (UUID) - Reference to clients table
- filename (TEXT) - Generated unique filename
- original_filename (TEXT) - User's original filename
- file_size (BIGINT) - File size in bytes
- mime_type (TEXT) - File MIME type
- storage_path (TEXT) - Path in Supabase storage
- uploaded_by (TEXT) - Who uploaded the file
- upload_date (TIMESTAMP) - When uploaded
- description (TEXT) - Optional description
- download_count (INTEGER) - Number of downloads
- last_accessed (TIMESTAMP) - Last download time
```

## Next Steps

After setup, your clients can:
1. **Upload documents** like contracts, invoices, marketing materials
2. **Download shared files** with tracked access
3. **Organize files** with descriptions and tags
4. **Monitor usage** through the statistics dashboard

The Files tool provides a secure, organized way to share documents with your clients while maintaining proper access controls and usage tracking. 