# Google Analytics Integration Setup Guide

This guide will help you connect your existing Google Analytics data to your VLA Dashboard to show real website traffic instead of demo data.

## 🎯 **Problem We're Solving**

Your website has this Google Analytics tag:
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-696993687"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-696993687');
</script>
```

But your VLA Dashboard analytics are only showing test data because it's not connected to your Google Analytics account.

## ✅ **Step 1: Create Google Service Account**

### 1.1 Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Enable the **Google Analytics Reporting API**

### 1.2 Create Service Account
1. Go to **IAM & Admin** → **Service Accounts**
2. Click **"Create Service Account"**
3. Name: `vla-dashboard-analytics`
4. Description: `Service account for VLA Dashboard analytics integration`
5. Click **"Create and Continue"**

### 1.3 Download Credentials
1. Click on your new service account
2. Go to **"Keys"** tab
3. Click **"Add Key"** → **"Create new key"**
4. Choose **JSON** format
5. Download the JSON file (keep it secure!)

## ✅ **Step 2: Connect Service Account to Google Analytics**

### 2.1 Get Your Google Analytics Property ID
1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your property
3. Go to **Admin** (gear icon)
4. Under **Property**, click **"Property Settings"**
5. Copy your **Property ID** (format: `123456789`)

### 2.2 Add Service Account to Analytics
1. In Google Analytics **Admin** → **Property Access Management**
2. Click **"+"** → **"Add users"**
3. Enter your service account email from the JSON file
4. Select **"Viewer"** permissions
5. Click **"Add"**

## ✅ **Step 3: Update Your VLA Dashboard**

### 3.1 Add Environment Variables
Add these to your `.env.local` file:

```env
# Google Analytics API Credentials
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"
```

**Important:** Get these values from your downloaded JSON file:
- `client_email` → `GOOGLE_CLIENT_EMAIL`
- `private_key` → `GOOGLE_PRIVATE_KEY`

### 3.2 Update Property ID in Code
Edit `vla-dashboard/app/api/analytics/google/route.ts`:

```typescript
// Change this line to your Property ID
const GA_PROPERTY_ID = 'properties/YOUR_PROPERTY_ID_HERE'
```

Replace `YOUR_PROPERTY_ID_HERE` with your actual Property ID (without the word "properties/").

## ✅ **Step 4: Test the Integration**

### 4.1 Restart Your Development Server
```bash
cd vla-dashboard
npm run dev
```

### 4.2 Test Analytics Dashboard
1. Go to `http://localhost:3000/dashboard/analytics`
2. Select your client
3. Click **"Sync GA"** button
4. Look for **"Google Analytics"** badge instead of **"Demo Data"**

### 4.3 Check Console Logs
Look for these messages in your browser console:
- ✅ `"Google Analytics sync successful"`
- ✅ `"Using Google Analytics data"`

## 🔧 **Step 5: Verify Real Data**

After successful setup, you should see:
- **Real page view numbers** from your website
- **Actual top pages** from your site
- **Real session data** and user counts
- **Blue "Google Analytics" badge** instead of "Demo Data"

## 🚨 **Troubleshooting**

### Issue: "Google Analytics credentials not configured"
**Solution:** Check that `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY` are set correctly in `.env.local`

### Issue: "Access denied" or "Permission denied"
**Solution:** 
1. Verify the service account email is added to Google Analytics with Viewer permissions
2. Check that the Google Analytics Reporting API is enabled in Google Cloud Console

### Issue: "Property not found"
**Solution:** 
1. Verify your Property ID is correct (just the numbers, not the full "properties/123456789")
2. Make sure you're using GA4 property, not Universal Analytics

### Issue: "Invalid private key"
**Solution:** 
1. Make sure the private key includes the full `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines
2. Ensure newlines are properly escaped as `\n`

### Issue: Still showing demo data
**Solution:**
1. Click the **"Sync GA"** button in the analytics dashboard
2. Check browser console for error messages
3. Verify your website has recent traffic in Google Analytics

## 📊 **What Data Gets Synced**

The integration pulls these metrics from Google Analytics:
- **Page Views** - Total visits to all pages
- **Sessions** - User sessions on your website  
- **Active Users** - Unique visitors
- **Top Pages** - Most visited pages with view counts
- **Session Duration** - Average time spent on site
- **Daily Trends** - Page views and sessions by date

## 🔄 **Ongoing Usage**

### Manual Sync
- Click **"Sync GA"** button in the dashboard anytime
- Data syncs for the selected date range (7d, 30d, etc.)

### Automatic Updates
- Dashboard automatically tries Google Analytics if no local data exists
- Real-time updates whenever you refresh or change date ranges

### Data Sources
The dashboard will show a badge indicating the data source:
- 🟢 **"Live Data"** - Real data from your tracking system
- 🔵 **"Google Analytics"** - Data from Google Analytics API
- 🟡 **"Demo Data"** - Fallback demo data when no real data available

## 🎯 **Expected Results**

After setup, your analytics dashboard will show:
- **Real traffic numbers** instead of demo data (15,420 → your actual page views)
- **Actual popular pages** from your website
- **True session counts** and user engagement metrics
- **Historical trends** based on your real Google Analytics data

## 📈 **Benefits**

✅ **Accurate Reporting** - Show clients real performance data
✅ **Historical Data** - Access months of past analytics
✅ **Multiple Clients** - Each client can connect their own Google Analytics
✅ **Automatic Sync** - Seamless integration with existing Google Analytics setup
✅ **No Website Changes** - Keep your existing Google Analytics tag

Your VLA Dashboard will now display the actual website performance data that matches what you see in Google Analytics! 🚀 