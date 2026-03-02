import { Hono } from 'hono'
import * as courseStore from '../services/courseStore'
import { generateHtml } from '../services/template'

const exportRoute = new Hono()

// Export course as HTML
exportRoute.get('/:id/html', async (c) => {
  const id = c.req.param('id')
  const course = await courseStore.getCourse(id)
  
  if (!course) {
    return c.json({ error: 'Course not found' }, 404)
  }
  
  const html = generateHtml(course)
  
  return c.html(html)
})

// Download course as JSON
exportRoute.get('/:id/json', async (c) => {
  const id = c.req.param('id')
  const course = await courseStore.getCourse(id)
  
  if (!course) {
    return c.json({ error: 'Course not found' }, 404)
  }
  
  return c.json(course)
})

// Export and download as file
exportRoute.get('/:id/download', async (c) => {
  const id = c.req.param('id')
  const format = c.req.query('format') || 'html'
  const course = await courseStore.getCourse(id)
  
  if (!course) {
    return c.json({ error: 'Course not found' }, 404)
  }
  
  if (format === 'json') {
    const json = JSON.stringify(course, null, 2)
    return new Response(json, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${course.slug}.json"`
      }
    })
  }
  
  const html = generateHtml(course)
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      'Content-Disposition': `attachment; filename="${course.slug}.html"`
    }
  })
})

export default exportRoute