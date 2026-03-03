import type { Course } from '../types/course'

const SCOUTOS_API_KEY = process.env.SCOUTOS_API_KEY || process.env.SCOUT_SECRET_KEY
const SCOUTOS_WORKSPACE_ID = process.env.SCOUTOS_WORKSPACE_ID || 'cmlo0kbsp19t00qs65zsgougw'
// Default to Technical Sales Support agent - can be overridden via env
const SCOUTOS_AGENT_ID = process.env.SCOUTOS_AGENT_ID || 'cmm9ufh820ghe0ps63v57its4'

interface ScoutOSInteractResponse {
  id?: string
  content?: string
  text?: string
  message?: string
  response?: string
  output?: string
  result?: string
  // Agent responses can come in various formats
  [key: string]: any
}

/**
 * Generate a course from a video transcript using ScoutOS Agent
 * Uses the ScoutOS Agent API: POST /world/{agent_id}/_interact_sync
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
  
  // Use ScoutOS Agent API
  // The agent API expects input/message as a direct string
  const systemPrompt = `You are an expert course designer. You create structured, interactive video courses from transcripts.

Your courses are:
- Clear and actionable
- Broken into logical steps
- Each step has a specific learning objective
- Checkpoints help learners track progress
- Timestamps correspond to video sections

Output valid JSON only. No markdown, no explanation, just the JSON object.`

  const fullPrompt = `${systemPrompt}\n\n---\n\n${prompt}`

  // ScoutOS Agent API format based on error analysis
  // The API requires "messages" array
  // content should be a string directly (not wrapped in an object)
  // Let's try with role field as that's typically expected
  const payload = {
    messages: [
      { role: "user", content: fullPrompt }
    ]
  }
  
  console.log('ScoutOS request format check:', {
    hasMessages: 'messages' in payload,
    contentType: typeof payload.messages[0].content,
    contentPreview: payload.messages[0].content.substring(0, 50) + '...',
    stringified: JSON.stringify(payload.messages[0]).substring(0, 100)
  })
  
  let response = await fetch(`https://api.scoutos.com/world/${SCOUTOS_AGENT_ID}/_interact_sync`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SCOUTOS_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`ScoutOS API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  console.log('ScoutOS response:', JSON.stringify(data, null, 2))

  // Response is an array of messages: [{role, content, sources, timestamp}, ...]
  // The assistant's response is the last message
  let content: string
  if (Array.isArray(data)) {
    console.log('ScoutOS response is array with', data.length, 'items')
    const assistantMsg = data.find((m: any) => m.role === 'assistant')
    if (assistantMsg?.content) {
      content = assistantMsg.content
    } else {
      // Concatenate all content from messages with content
      const contentParts = data
        .filter((m: any) => m.content && typeof m.content === 'string')
        .map((m: any) => m.content)
      content = contentParts.join('\n')
    }
  } else if (typeof data === 'object' && data !== null) {
    // Fallback for other response formats
    content = (data as any).content || (data as any).text || (data as any).message || 
              (data as any).response || (data as any).output || JSON.stringify(data)
  } else {
    content = String(data)
  }

  if (!content) {
    throw new Error('No content received from ScoutOS')
  }
  console.log('Extracted content length:', content.length, 'First 200 chars:', content.substring(0, 200))
  
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

/**
 * Advanced JSON repair for malformed AI responses
 * Handles: truncated objects, duplicate keys, malformed arrays, unterminated strings
 */
function repairJson(jsonStr: string): any {
  console.log('Attempting JSON repair...')
  
  // Step 1: Clean up markdown code blocks
  let cleaned = jsonStr.replace(/```(?:json)?\s*/g, '').replace(/```\s*$/g, '')
  
  // Step 2: Extract just the JSON object (steps and resources)
  const jsonMatch = cleaned.match(/\{[\s\S]*"steps"[\s\S]*"resources"[\s\S]*\}/)
  if (jsonMatch) {
    cleaned = jsonMatch[0]
  }
  
  // Step 3: Fix common issues
  cleaned = cleaned
    // Remove trailing commas
    .replace(/,\s*([}\]])/g, '$1')
    // Fix missing commas between array items
    .replace(/\}\s*\{/g, '},{')
    // Fix newlines in string values (replace with spaces)
    .replace(/"([^"]*?)\n([^"]*?)"/g, '"$1 $2"')
  
  // Step 4: Try parsing with increasing repair attempts
  try {
    return JSON.parse(cleaned)
  } catch (e) {
    console.log('Initial parse failed, trying structural repair...')
  }
  
  // Step 5: Extract valid step objects using improved regex pattern matching
  // Handle content with escaped quotes and newlines
  const steps: any[] = []
  const resources: any[] = []

  // Use a more robust pattern that handles escaped quotes and multi-line content
  // Match individual step objects by looking for the step structure
  const stepObjectPattern = /\{\s*"title"\s*:\s*"(?<title>(?:[^"\\]|\\.)*)"\s*,\s*"videoTimestamp"\s*:\s*"(?<videoTimestamp>(?:[^"\\]|\\.)*)"\s*,?\s*(?:"videoEndTimestamp"\s*:\s*"(?<videoEndTimestamp>(?:[^"\\]|\\.)*)"\s*,?\s*)?"content"\s*:\s*"(?<content>(?:[^"\\]|\\.|\n)*)"\s*,?\s*"estimatedTime"\s*:\s*"(?<estimatedTime>(?:[^"\\]|\\.)*)"/gi

  let stepMatch
  while ((stepMatch = stepObjectPattern.exec(cleaned)) !== null) {
    const groups = stepMatch.groups
    if (groups?.title) {
      steps.push({
        title: groups.title.replace(/\\"/g, '"').replace(/\\n/g, '\n'),
        videoTimestamp: groups.videoTimestamp || '0:00',
        videoEndTimestamp: groups.videoEndTimestamp?.replace(/\\"/g, '"'),
        content: (groups.content || '').replace(/\\"/g, '"').replace(/\\n/g, '\n'),
        estimatedTime: groups.estimatedTime || '5 minutes'
      })
    }
  }

  // If the sophisticated pattern didn't work, try a simpler approach
  if (steps.length === 0) {
    // Split by step titles and extract each step's data
    const titleMatches = [...cleaned.matchAll(/"title"\s*:\s*"((?:[^"\\]|\\.)*)"/gi)]
    const tsMatches = [...cleaned.matchAll(/"videoTimestamp"\s*:\s*"([^"]*)"/gi)]
    const endTsMatches = [...cleaned.matchAll(/"videoEndTimestamp"\s*:\s*"([^"]*)"/gi)]

    for (let i = 0; i < titleMatches.length; i++) {
      const title = titleMatches[i][1].replace(/\\"/g, '"')
      // Find content between this title and the next title (or end of steps array)
      const startIdx = titleMatches[i].index! + titleMatches[i][0].length
      const endIdx = titleMatches[i + 1]?.index || cleaned.indexOf('"resources"')
      const stepBlock = cleaned.substring(startIdx, endIdx)

      // Extract content from this step block - handle escaped quotes
      const contentMatch = stepBlock.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*)"/)
      const timeMatch = stepBlock.match(/"estimatedTime"\s*:\s*"([^"]*)"/)
      const checkpointMatch = stepBlock.match(/"checkpoint"\s*:\s*\{\s*"label"\s*:\s*"([^"]*)"/)

      steps.push({
        title,
        videoTimestamp: tsMatches[i]?.[1] || '0:00',
        videoEndTimestamp: endTsMatches[i]?.[1],
        content: contentMatch?.[1]?.replace(/\\"/g, '"').replace(/\\n/g, '\n') || '',
        estimatedTime: timeMatch?.[1] || '5 minutes',
        checkpoint: { label: checkpointMatch?.[1] || 'I completed this step' }
      })
    }
  }

  // If we found steps via regex, construct valid structure
  if (steps.length > 0) {
    console.log(`Extracted ${steps.length} steps via pattern matching`)
    // Also extract resources
    const resourcePattern = /\{\s*"label"\s*:\s*"([^"]+)"[^}]*"url"\s*:\s*"([^"]+)"/gi
    let resourceMatch
    while ((resourceMatch = resourcePattern.exec(cleaned)) !== null) {
      resources.push({
        label: resourceMatch[1],
        url: resourceMatch[2]
      })
    }
    return { steps, resources }
  }
  
  throw new Error('Could not parse or repair JSON from AI response')
}

function parseCourseJson(content: string, videoUrl: string): { steps: Course['steps']; resources: Course['resources'] } {
  console.log('Raw response content length:', content.length)
  console.log('First 500 chars:', content.substring(0, 500))
  
  // Extract from markdown code blocks if present
  let jsonStr = content
  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim()
    console.log('Extracted from markdown code block')
  }
  
  if (!jsonStr.trim()) {
    throw new Error('No valid JSON found in response - empty content')
  }
  
  let parsed: any
  
  // Try direct parse first
  try {
    parsed = JSON.parse(jsonStr)
    console.log('Direct JSON parse successful')
  } catch (e) {
    console.log('Direct parse failed, attempting repair:', (e as Error).message)
    parsed = repairJson(jsonStr)
  }
  
  // Validate and transform steps
  const steps: Course['steps'] = (parsed.steps || []).map((step: any, index: number) => ({
    id: `step-${index + 1}`,
    title: step.title || `Step ${index + 1}`,
    videoUrl,
    videoTimestamp: step.videoTimestamp || step.video_start || '0:00',
    videoEndTimestamp: step.videoEndTimestamp || step.video_end,
    content: typeof step.content === 'string' ? step.content : JSON.stringify(step.content) || '',
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
}

/**
 * Deploy course to ZenBin
 */
export async function deployToZenBin(course: Course): Promise<{ zenbinId: string; zenbinUrl: string }> {
  const { generateHtml } = await import('./template')
  const html = generateHtml(course)
  
  // Use course slug as the page ID for ZenBin
  // ZenBin API requires: POST /v1/pages/{id} with {html: "..."}
  const pageId = course.slug || course.id
  
  const response = await fetch(`https://zenbin.org/v1/pages/${pageId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      html: html,
      title: course.meta.title
    })
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`ZenBin deploy failed: ${response.status} - ${error}`)
  }
  
  const data = await response.json() as { id: string; url?: string }
  
  return {
    zenbinId: data.id,
    zenbinUrl: data.url || `https://zenbin.org/p/${data.id}`
  }
}