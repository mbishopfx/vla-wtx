# 🔑 Google APIs Client Integration Guide

## Overview
This guide walks through connecting client Google accounts to pull real Analytics, Ads, and Search Console data for competitive intelligence and performance tracking.

## 🏗️ **Architecture Overview**

```
Client's Google Account
├── Google Analytics 4 Property
├── Google Ads Account
├── Google Search Console Property
└── Google My Business (optional)
```

## 📊 **1. Google Analytics 4 (GA4) Integration**

### **What You Need:**
- **GA4 Property ID** (format: `123456789`)
- **OAuth 2.0 Access** to client's Analytics account
- **Analytics Reporting API** enabled

### **Step 1: Enable Analytics API**
```bash
# In Google Cloud Console for your project
1. Go to APIs & Services > Library
2. Search "Google Analytics Reporting API"
3. Enable "Google Analytics Data API v1"
4. Enable "Google Analytics Admin API v1"
```

### **Step 2: Get Client's GA4 Property ID**
```javascript
// The client needs to provide their GA4 Property ID
// Found in: GA4 > Admin > Property Settings > Property ID
// Format: 123456789 (9-digit number)
```

### **Step 3: OAuth Setup for Client Access**
```javascript
// Scopes needed for Analytics
const ANALYTICS_SCOPES = [
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/analytics.manage.users.readonly'
]
```

## 🎯 **2. Google Ads Integration**

### **What You Need:**
- **Google Ads Customer ID** (format: `123-456-7890`)
- **Developer Token** (from your Google Ads Manager account)
- **OAuth 2.0 Access** to client's Ads account

### **Step 1: Get Developer Token**
```bash
1. Go to Google Ads > Tools & Settings > API Center
2. Apply for Developer Token (requires Google Ads Manager account)
3. Wait for approval (can take 24-48 hours)
```

### **Step 2: Enable Google Ads API**
```bash
# In Google Cloud Console
1. APIs & Services > Library
2. Search "Google Ads API"
3. Enable "Google Ads API"
```

### **Step 3: Get Client's Customer ID**
```javascript
// Client finds this in their Google Ads account
// Location: Google Ads > Settings > Account Settings
// Format: 123-456-7890 (with dashes) or 1234567890 (without)
```

### **OAuth Scopes for Ads:**
```javascript
const ADS_SCOPES = [
  'https://www.googleapis.com/auth/adwords'
]
```

## 🔍 **3. Google Search Console Integration**

### **What You Need:**
- **Website URL** (the domain they want to track)
- **OAuth 2.0 Access** to client's Search Console
- **Verification** that client owns the website

### **Step 1: Enable Search Console API**
```bash
# In Google Cloud Console
1. APIs & Services > Library  
2. Search "Google Search Console API"
3. Enable "Search Console API"
```

### **OAuth Scopes for Search Console:**
```javascript
const SEARCH_CONSOLE_SCOPES = [
  'https://www.googleapis.com/auth/webmasters.readonly'
]
```

## 🔐 **4. Complete OAuth 2.0 Setup**

### **Step 1: Create OAuth 2.0 Credentials**
```bash
# In Google Cloud Console
1. APIs & Services > Credentials
2. Create Credentials > OAuth 2.0 Client IDs
3. Application type: Web application
4. Authorized redirect URIs: 
   - http://localhost:3000/api/auth/google/callback
   - https://yourdomain.com/api/auth/google/callback
```

### **Step 2: Add OAuth Credentials to Environment**
```env
# Add to .env.local
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Combined scopes for all services
GOOGLE_OAUTH_SCOPES=https://www.googleapis.com/auth/analytics.readonly,https://www.googleapis.com/auth/adwords,https://www.googleapis.com/auth/webmasters.readonly
```

## 💾 **5. Database Schema for Client API Access**

### **Add to clients table:**
```sql
-- Add these columns to existing clients table
ALTER TABLE clients ADD COLUMN google_analytics_property_id VARCHAR(50);
ALTER TABLE clients ADD COLUMN google_ads_customer_id VARCHAR(20);
ALTER TABLE clients ADD COLUMN google_search_console_domain VARCHAR(255);
ALTER TABLE clients ADD COLUMN google_oauth_access_token TEXT;
ALTER TABLE clients ADD COLUMN google_oauth_refresh_token TEXT;
ALTER TABLE clients ADD COLUMN google_oauth_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE clients ADD COLUMN google_oauth_scope TEXT;
ALTER TABLE clients ADD COLUMN google_apis_connected_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE clients ADD COLUMN google_apis_last_sync TIMESTAMP WITH TIME ZONE;
```

## 🔄 **6. OAuth Flow Implementation**

### **Step 1: Initiate OAuth (Client clicks "Connect Google")**
```javascript
// GET /api/auth/google/initiate?clientId=123
const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
  client_id: process.env.GOOGLE_CLIENT_ID,
  redirect_uri: process.env.GOOGLE_REDIRECT_URI,
  scope: process.env.GOOGLE_OAUTH_SCOPES,
  response_type: 'code',
  state: clientId, // Pass client ID to identify which client is connecting
  access_type: 'offline',
  prompt: 'consent'
})}`;
```

### **Step 2: Handle OAuth Callback**
```javascript
// POST /api/auth/google/callback
// Exchange authorization code for access tokens
// Store tokens in database linked to client
```

### **Step 3: API Data Retrieval**
```javascript
// Use stored tokens to fetch client data
// Refresh tokens automatically when expired
```

## 📱 **7. Client Onboarding Process**

### **What the Client Needs to Do:**

#### **For Analytics:**
1. Share their GA4 Property ID
2. Grant access through OAuth flow
3. Ensure you have "Viewer" permission minimum

#### **For Google Ads:**
1. Share their Customer ID (123-456-7890)
2. Grant access through OAuth flow  
3. Ensure you have "Standard" access minimum

#### **For Search Console:**
1. Verify they own the website domain
2. Grant access through OAuth flow
3. Ensure website is verified in their Search Console

### **Information Collection Form:**
```javascript
const clientGoogleInfo = {
  // Required
  analyticsPropertyId: "123456789",
  adsCustomerId: "123-456-7890", 
  searchConsoleDomain: "https://clientwebsite.com",
  
  // Auto-collected via OAuth
  accessToken: "...",
  refreshToken: "...",
  expiresAt: "2024-01-01T00:00:00Z"
}
```

## 🔧 **8. Testing & Validation**

### **Test Checklist:**
- [ ] Client can complete OAuth flow
- [ ] Analytics data pulls successfully
- [ ] Ads data retrieves properly
- [ ] Search Console data loads
- [ ] Tokens refresh automatically
- [ ] Error handling works for expired access

### **Common Issues:**
1. **"insufficient_access"** - Client needs to grant proper permissions
2. **"invalid_credentials"** - Check API keys and OAuth setup
3. **"quota_exceeded"** - Review API usage limits
4. **"property_not_found"** - Verify Analytics Property ID

## 📊 **9. Data You Can Access**

### **From Analytics:**
- Website traffic and user behavior
- Conversion tracking
- E-commerce data
- Custom events and goals

### **From Google Ads:**
- Campaign performance
- Keyword data
- Ad spend and ROI
- Audience insights

### **From Search Console:**
- Search rankings
- Click-through rates
- Search queries
- Core Web Vitals

## 🚀 **10. Next Steps**

1. **Set up OAuth credentials** in Google Cloud Console
2. **Add environment variables** to `.env.local`
3. **Create client onboarding flow** in your dashboard
4. **Test with a real client account**
5. **Implement data sync** for competitive analysis

---

## ⚠️ **Important Security Notes**

- **Never store API keys in client-side code**
- **Use refresh tokens** to maintain long-term access
- **Implement proper error handling** for expired tokens
- **Follow Google's API usage policies**
- **Get explicit client consent** before accessing their data

This integration allows you to pull real client data for competitive analysis and performance tracking rather than using mock data. 