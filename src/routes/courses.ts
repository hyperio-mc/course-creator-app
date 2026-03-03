import { Hono } from 'hono'
import { v4 as uuidv4 } from 'uuid'
import * as courseStore from '../services/courseStore'
import type { Course, CourseInput } from '../types/course'

const courses = new Hono()

// List all courses
courses.get('/', async (c) => {
  const list = await courseStore.listCourses()
  return c.json({ courses: list, count: list.length })
})

// Get course by ID or slug
courses.get('/:id', async (c) => {
  const id = c.req.param('id')
  
  // Try by ID first
  let course = await courseStore.getCourse(id)
  
  // Try by slug if not found
  if (!course) {
    course = await courseStore.getCourseBySlug(id)
  }
  
  if (!course) {
    return c.json({ error: 'Course not found' }, 404)
  }
  
  return c.json({ course })
})

// Create new course
courses.post('/', async (c) => {
  const input = await c.req.json<CourseInput>()
  
  const id = uuidv4()
  const slug = courseStore.generateSlug(input.meta.title)
  const now = new Date().toISOString()
  
  const course: Course = {
    id,
    slug,
    meta: input.meta,
    steps: (input.steps || []).map((step, index) => ({
      ...step,
      id: `step-${index + 1}`
    })),
    resources: input.resources || [],
    createdAt: now,
    updatedAt: now
  }
  
  await courseStore.createCourse(course)
  
  return c.json({ course }, 201)
})

// Update course
courses.put('/:id', async (c) => {
  const id = c.req.param('id')
  const updates = await c.req.json<Partial<Course>>()
  
  const course = await courseStore.updateCourse(id, updates)
  
  if (!course) {
    return c.json({ error: 'Course not found' }, 404)
  }
  
  return c.json({ course })
})

// Delete course
courses.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const deleted = await courseStore.deleteCourse(id)
  
  if (!deleted) {
    return c.json({ error: 'Course not found' }, 404)
  }
  
  return c.json({ success: true })
})

export default courses