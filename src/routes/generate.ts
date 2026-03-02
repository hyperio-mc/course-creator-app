import { Hono } from 'hono'
import * as scoutos from '../services/scoutos'
import * as courseStore from '../services/courseStore'
import { v4 as uuidv4 } from 'uuid'
import type { GenerateCourseInput, Course } from '../types/course'

const generate = new Hono()

// Generate course from transcript
generate.post('/', async (c) => {
  try {
    const input = await c.req.json<GenerateCourseInput>()
    
    if (!input.videoUrl) {
      return c.json({ error: 'videoUrl is required' }, 400)
    }
    
    if (!input.transcript) {
      return c.json({ error: 'transcript is required' }, 400)
    }
    
    // Generate course structure from ScoutOS
    const { steps, resources } = await scoutos.generateCourseFromTranscript(
      input.videoUrl,
      input.transcript,
      input.meta || {}
    )
    
    // Create course object
    const id = uuidv4()
    const slug = courseStore.generateSlug(input.meta?.title || 'Untitled Course')
    const now = new Date().toISOString()
    
    const course: Course = {
      id,
      slug,
      meta: {
        title: input.meta?.title || 'Untitled Course',
        description: input.meta?.description || '',
        author: input.meta?.author || 'Unknown',
        estimatedTime: input.meta?.estimatedTime || estimateTotalTime(steps),
        difficulty: input.meta?.difficulty || 'beginner'
      },
      steps,
      resources,
      createdAt: now,
      updatedAt: now
    }
    
    // Save to store
    await courseStore.createCourse(course)
    
    return c.json({ course }, 201)
  } catch (error) {
    console.error('Course generation error:', error)
    return c.json({ 
      error: 'Failed to generate course',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Deploy course to ZenBin
generate.post('/:id/deploy', async (c) => {
  try {
    const id = c.req.param('id')
    const course = await courseStore.getCourse(id)
    
    if (!course) {
      return c.json({ error: 'Course not found' }, 404)
    }
    
    const result = await scoutos.deployToZenBin(course)
    
    // Update course with ZenBin info
    await courseStore.updateCourse(id, {
      zenbinId: result.zenbinId,
      zenbinUrl: result.zenbinUrl
    })
    
    return c.json({
      success: true,
      zenbinUrl: result.zenbinUrl
    })
  } catch (error) {
    console.error('Deploy error:', error)
    return c.json({
      error: 'Failed to deploy course',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

function estimateTotalTime(steps: Course['steps']): string {
  const totalMinutes = steps.reduce((acc, step) => {
    const match = step.estimatedTime.match(/(\d+)/)
    return acc + (match ? parseInt(match[1]) : 5)
  }, 0)
  
  if (totalMinutes < 60) {
    return `${totalMinutes} minutes`
  }
  
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  
  if (mins === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`
  }
  
  return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minutes`
}

export default generate