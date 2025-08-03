# Complete VLA Dashboard Setup Guide

Follow these steps to get your VLA Dashboard running 100% with all client data.

## ✅ **Step 1: Supabase Database Setup**

### 1.1 Run All SQL Files in Order

Execute these SQL files in your **Supabase SQL Editor** in this exact order:

```bash
# Run these in Supabase Dashboard → SQL Editor
1. ./sql-exports/01_create_tables.sql
2. ./sql-exports/02_functions_and_rls.sql  
3. ./sql-exports/03_sample_data.sql
4. ./sql-exports/06_vehicles_table.sql
5. ./sql-exports/13_files_storage_system.sql
```

### 1.2 Verify Tables Exist

After running the SQL, confirm these tables exist in your database:
- ✅ `clients`
- ✅ `client_analytics_events` 
- ✅ `competitors`
- ✅ `vehicles`
- ✅ `client_files`

## ✅ **Step 2: Supabase Storage Setup**

### 2.1 Create Storage Bucket

1. **Go to Supabase Dashboard** → **Storage** → **Buckets**
2. **Click "New Bucket"**
   - Bucket name: `client-files`
   - Public bucket: **NO** 
   - File size limit: `50MB`
3. **Click "Create Bucket"**

### 2.2 Set Storage Policies

Run these in **Supabase SQL Editor**:

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

## ✅ **Step 3: Environment Variables**

### 3.1 Update `.env.local` File

Make sure your `.env.local` file has ALL these variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI Configuration (if using AI features)
OPENAI_API_KEY=your_openai_api_key_here

# Google APIs (if using Google integrations)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 3.2 Get Your Supabase Keys

1. **Go to Supabase Dashboard** → **Settings** → **API**
2. **Copy these values:**
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Project API Keys → `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Project API Keys → `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

## ✅ **Step 4: Import Real Client Data**

### 4.1 Add Your Clients

Either use the setup page or add clients manually:

**Option A: Use Setup Page**
- Go to `http://localhost:3000/dashboard/setup`
- Add client information
- Import vehicle data

**Option B: Add Manually via API**
```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your Client Name",
    "business_name": "Client Business Name",
    "website": "https://clientwebsite.com",
    "industry": "Automotive",
    "location": "City, State"
  }'
```

### 4.2 Import Vehicle Inventory

**For Inventory Optimizer to work:**

1. **Go to** `http://localhost:3000/dashboard/agents/inventory-optimizer`
2. **Select your client**
3. **Upload your TSV file** (`products_2025-08-03_01:35:31.tsv` or similar)
4. **Verify vehicles appear** in the inventory list

### 4.3 Add Competitor Data

**For Competitor Intelligence to work:**

1. **Go to** `http://localhost:3000/dashboard/agents/competitors`
2. **Select your client**
3. **Click "Add Competitor"**
4. **Enter competitor details:**
   - Business name
   - Website URL
   - Address
   - Notes

## ✅ **Step 5: Test All Features**

### 5.1 Test Analytics Dashboard

1. **Go to** `http://localhost:3000/dashboard/analytics`
2. **Select a client**
3. **Generate demo data** if needed
4. **Verify charts and metrics display**

### 5.2 Test Inventory Optimizer

1. **Go to** `http://localhost:3000/dashboard/agents/inventory-optimizer`
2. **Select client with vehicles**
3. **Upload TSV file**
4. **Test optimization and export**

### 5.3 Test Competitor Intelligence

1. **Go to** `http://localhost:3000/dashboard/agents/competitors`
2. **Select client**
3. **Add competitors**
4. **Test analysis features**

### 5.4 Test Files Tool

1. **Go to** `http://localhost:3000/dashboard/tools/files`
2. **Select client**
3. **Upload test files (PDF, images, etc.)**
4. **Test download functionality**

## ✅ **Step 6: Production Deployment (Optional)**

### 6.1 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### 6.2 Configure Domain (Optional)

- Set up custom domain in Vercel
- Update CORS settings in Supabase if needed

## 🚨 **Common Issues & Solutions**

### Issue: "relation 'vehicles' does not exist"
**Solution:** Run `06_vehicles_table.sql` in Supabase SQL Editor

### Issue: "Failed to upload file to storage"
**Solution:** 
1. Create `client-files` bucket in Supabase Storage
2. Run storage policies from Step 2.2

### Issue: "Client ID is required" in API calls
**Solution:** Make sure you have clients in the database (Step 4.1)

### Issue: No analytics data showing
**Solution:** 
1. Check `client_analytics_events` table exists
2. Use "Generate Demo Data" button if needed

### Issue: TSV upload returns "inserted 0 vehicles"
**Solution:** 
1. Ensure `vehicles` table exists
2. Check TSV file format matches expected structure

## 📊 **Final Verification Checklist**

Check these URLs work with data:

- ✅ `http://localhost:3000/dashboard` - Main dashboard
- ✅ `http://localhost:3000/dashboard/analytics` - Analytics with charts
- ✅ `http://localhost:3000/dashboard/agents/inventory-optimizer` - Shows vehicles
- ✅ `http://localhost:3000/dashboard/agents/competitors` - Shows competitors  
- ✅ `http://localhost:3000/dashboard/tools/files` - File upload/download
- ✅ `http://localhost:3000/api/clients` - Returns client list
- ✅ `http://localhost:3000/api/vehicles/import` - Accepts TSV uploads

## 🎯 **Your VLA Dashboard Features**

After setup, you'll have:

### **2 AI Agents:**
1. **Inventory Optimizer** - Upload TSV, optimize listings, bulk export
2. **Competitor Intelligence** - Add competitors, analyze websites

### **Core Tools:**
1. **Analytics Dashboard** - Track client performance and metrics
2. **Files Tool** - Secure client document sharing
3. **Client Management** - Multi-client support

### **Key Capabilities:**
- ✅ Real client data (no mock data)
- ✅ TSV vehicle import/export
- ✅ Competitor analysis and monitoring
- ✅ Secure file sharing with download tracking
- ✅ Performance analytics and reporting
- ✅ Multi-client support with data isolation

## 📞 **Need Help?**

If you encounter issues:
1. Check the Supabase logs for database errors
2. Check browser console for frontend errors  
3. Verify all environment variables are set
4. Ensure all SQL files have been executed
5. Test API endpoints directly with curl

**Your VLA Dashboard is now ready for production use with real client data!** 🚀 