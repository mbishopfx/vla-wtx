# 🚗 VLA Dashboard - Nissan Campaign Creator

**AI-Powered Google Ads Campaign Generator for Nissan of Wichita Falls**

## 🌟 Overview

VLA Dashboard is a specialized tool for creating optimized Google Ads campaigns specifically for Nissan of Wichita Falls. It uses GPT-4o to generate ready-to-copy ad content and comprehensive budget strategies.

## ✨ Key Features

### 🎯 Nissan-Specific Optimization
- **Local Market Focus**: Wichita Falls, Burkburnett, Iowa Park, Electra targeting
- **Military Targeting**: Sheppard Air Force Base specific campaigns
- **Nissan Brand Expertise**: Model-specific campaigns (Altima, Rogue, Sentra, etc.)

### 📝 Google Ads Ready Content
- **15 Headlines** (30 character limit) - ready to copy
- **30 Descriptions** (90 character limit) - ready to copy
- **Keywords by Match Type** (exact, phrase, broad)
- **10 Callout Extensions**
- **8 Sitelinks** with descriptions
- **Campaign Settings** ready to implement

### 💾 Export & Integration
- **TXT Export**: One-click download for easy copy/paste into Google Ads
- **Budget Optimization**: AI-generated budget allocation strategies
- **Performance Projections**: Realistic expectations for North Texas market

## 🚀 Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, Framer Motion
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4o
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- Supabase account
- OpenAI API key
- Vercel account (for deployment)

## 🛠️ Environment Variables

Create a `.env.local` file with:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Optional: Google APIs (for future integrations)
GOOGLE_API_KEY=your_google_api_key
```

## 📊 Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `sql-exports/16_budget_strategies_system.sql`
3. This creates the budget_strategies tables with proper RLS policies

## 🏃‍♂️ Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000/dashboard/tools/budget-strategy`

### Vercel Deployment

1. **Push to GitHub** (see commands below)
2. **Connect to Vercel**: Import from GitHub
3. **Add Environment Variables**: In Vercel dashboard
4. **Deploy**: Automatic deployment on push

## 📁 Project Structure

```
vla-dashboard/
├── app/
│   ├── api/budget-strategy/generate/     # Campaign generation API
│   ├── dashboard/
│   │   ├── layout.tsx                    # Dashboard layout with navigation
│   │   └── tools/budget-strategy/        # Main campaign creator page
│   └── globals.css
├── lib/ai-agents/
│   └── budget-strategy-agent.ts          # GPT-4o powered campaign generator
├── sql-exports/
│   └── 16_budget_strategies_system.sql   # Database schema
└── components/ui/                        # Reusable UI components
```

## 🎨 UI Features

- **Glassmorphism Design**: Modern, professional interface
- **Responsive Layout**: Works on desktop and mobile
- **Real-time Validation**: Form validation with helpful errors
- **Progress Indicators**: Visual feedback during AI generation
- **Copy-to-Clipboard**: Easy copying of generated content

## 🔒 Security

- **Row Level Security**: Supabase RLS policies
- **Environment Variables**: Secure API key management
- **Input Validation**: Comprehensive form validation
- **Rate Limiting**: Built-in OpenAI rate limiting

## 📈 Performance

- **GPT-4o**: 50% faster and cheaper than GPT-4
- **Static Generation**: Optimized Next.js build
- **Edge Functions**: Vercel edge deployment
- **Caching**: Intelligent caching strategies

## 🎯 Usage

1. **Configure Campaign**: Set budget, timeframe, and goals
2. **Define Audience**: Specify target audience and keywords  
3. **Generate Campaign**: AI creates complete campaign strategy
4. **Export Content**: Download TXT file for Google Ads
5. **Implement**: Copy/paste into Google Ads Manager

## 🛡️ Support

Built specifically for Nissan of Wichita Falls dealership marketing needs.

## 📄 License

Private - Nissan of Wichita Falls Internal Use

---

**Ready to generate high-converting Nissan campaigns! 🚗💨**
