import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const STORAGE_FILE = path.join(process.cwd(), 'data', 'saved_analyses.json')

// Read existing analyses
function readAnalyses() {
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

export async function GET(request: NextRequest) {
  try {
    const analyses = readAnalyses()

    return NextResponse.json({
      success: true,
      analyses: analyses
    })

  } catch (error) {
    console.error('List analyses error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve analyses' },
      { status: 500 }
    )
  }
} 