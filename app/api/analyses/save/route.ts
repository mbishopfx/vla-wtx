import { NextRequest, NextResponse } from 'next/server'

// Simple file-based storage for now (will be replaced with Supabase)
import fs from 'fs'
import path from 'path'

const STORAGE_FILE = path.join(process.cwd(), 'data', 'saved_analyses.json')

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.dirname(STORAGE_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Read existing analyses
function readAnalyses() {
  ensureDataDir()
  if (!fs.existsSync(STORAGE_FILE)) {
    return []
  }
  try {
    const data = fs.readFileSync(STORAGE_FILE, 'utf8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

// Write analyses to file
function writeAnalyses(analyses: any[]) {
  ensureDataDir()
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(analyses, null, 2))
}

export async function POST(request: NextRequest) {
  try {
    const analysisData = await request.json()
    
    const savedAnalysis = {
      id: crypto.randomUUID(),
      ...analysisData,
      created_at: new Date().toISOString()
    }

    // Read existing analyses and add new one
    const analyses = readAnalyses()
    analyses.unshift(savedAnalysis) // Add to beginning for newest first
    writeAnalyses(analyses)

    return NextResponse.json({
      success: true,
      message: 'Analysis saved successfully',
      analysis: savedAnalysis
    })

  } catch (error) {
    console.error('Save analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to save analysis' },
      { status: 500 }
    )
  }
} 