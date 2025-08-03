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

// Write analyses to file
function writeAnalyses(analyses: any[]) {
  const dataDir = path.dirname(STORAGE_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(analyses, null, 2))
}

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

    // Read existing analyses and remove the one with matching ID
    const analyses = readAnalyses()
    const filteredAnalyses = analyses.filter((analysis: any) => analysis.id !== analysisId)
    
    if (analyses.length === filteredAnalyses.length) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      )
    }

    // Write back the filtered list
    writeAnalyses(filteredAnalyses)

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