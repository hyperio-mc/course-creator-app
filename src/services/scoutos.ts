import type { Course } from '../types/course'

const SCOUTOS_API_KEY = process.env.SCOUTOS_API_KEY || process.env.SCOUT_SECRET_KEY
const SCOUTOS_WORKSPACE_ID = process.env.SCOUTOS_WORKSPACE_ID || 'cmlo0kbsp19t00qs65zsgougw'

interface ScoutOSMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ScoutOSResponse {
  id: string
  choices: Array<{
    message: {
      role: 'assistant'
      content: string
    }
    finish_reason: string
  }>
}

/**
 * Generate a course from a video transcript using ScoutOS Agent
 */
export async function generateCourseFromTranscript(
  videoUrl: string,
  transcript: string,
  meta: Partial<Course['meta']>
): Promise<{ steps: Course['steps']; resources: Course['resources'] }> {
  if (!SCOUTOS_API_KEY) {
    throw new Error('SCOUTOS_API_KEY not configured')
  }

  const prompt = buildCoursePrompt(videoUrl, transcript, meta)
  
  const response = await fetch('https://scoutos.com/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SCOUTOS_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      messages: [
        {
          role: 'system',
          content: `You are an expert course designer. You create structured, interactive video courses from transcripts.

Your courses are:
- Clear and actionable
- Broken into logical steps
- Each step has a specific learning objective
- Checkpoints help learners track progress
- Timestamps correspond to video sections

Output valid JSON only. No markdown, no explanation, just the JSON object.`
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`ScoutOS API error: ${response.status} - ${error}`)
  }

  const data = await response.json() as ScoutOSResponse
  const content = data.choices[0]?.message?.content || ''
  
  return parseCourseJson(content, videoUrl)
}

function buildCoursePrompt(videoUrl: string, transcript: string, meta: Partial<Course['meta']>): string {
  return `Create a course from this video transcript.

Video URL: ${videoUrl}
Title: ${meta.title || 'Untitled Course'}
Author: ${meta.author || 'Unknown'}
Description: ${meta.description || ''}

Transcript:
${transcript}

Generate a JSON object with this exact structure:
{
  "steps": [
    {
      "title": "Step title (short, action-oriented)",
      "videoTimestamp": "start timestamp (e.g. '0:30' or '90')",
      "videoEndTimestamp": "end timestamp (optional)",
      "content": "Markdown content with instructions, tips, and examples",
      "estimatedTime": "time estimate (e.g. '3 minutes')",
      "checkpoint": {
        "label": "Checkpoint text (e.g. 'I completed this step')",
        "hint": "Optional help text"
      }
    }
  ],
  "resources": [
    {
      "label": "Resource name",
      "url": "https://example.com"
    }
  ]
}

Requirements:
- Create 5-10 logical steps from the transcript
- Each step should cover a distinct topic or action
- Timestamps should correspond to video sections
- Content should be instructional, not just transcript
- Include practical exercises where appropriate
- Add helpful resources mentioned in the video

Output ONLY the JSON object. No other text.`
}

function parseCourseJson(content: string, videoUrl: string): { steps: Course['steps']; resources: Course['resources'] } {
  // Extract JSON from response (in case there's extra text)
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('No valid JSON found in response')
  }
  
  try {
    const parsed = JSON.parse(jsonMatch[0])
    
    // Validate and transform steps
    const steps: Course['steps'] = (parsed.steps || []).map((step: any, index: number) => ({
      id: `step-${index + 1}`,
      title: step.title || `Step ${index + 1}`,
      videoUrl,
      videoTimestamp: step.videoTimestamp || '0:00',
      videoEndTimestamp: step.videoEndTimestamp,
      content: step.content || '',
      estimatedTime: step.estimatedTime || '5 minutes',
      checkpoint: {
        label: step.checkpoint?.label || 'I completed this step',
        hint: step.checkpoint?.hint
      }
    }))
    
    const resources: Course['resources'] = (parsed.resources || []).map((r: { label?: string; url?: string }) => ({
      label: r.label || 'Resource',
      url: r.url || ''
    }))
    
    return { steps, resources }
  } catch (e) {
    throw new Error(`Failed to parse course JSON: ${e}`)
  }
}

/**
 * Deploy course to ZenBin
 */
export async function deployToZenBin(course: Course): Promise<{ zenbinId: string; zenbinUrl: string }> {
  const { generateHtml } = await import('./template')
  const html = generateHtml(course)
  const encodedHtml = Buffer.from(html).toString('base64')
  
  const response = await fetch('https://zenbin.onrender.com/v1/pages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      encoding: 'base64',
      html: encodedHtml,
      title: course.meta.title
    })
  })
  
  if (!response.ok) {
    throw new Error(`ZenBin deploy failed: ${response.status}`)
  }
  
  const data = await response.json() as { id: string; url?: string }
  
  return {
    zenbinId: data.id,
    zenbinUrl: data.url || `https://zenbin.onrender.com/p/${data.id}`
  }
}