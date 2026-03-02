import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { readFileSync } from 'fs'
import { join } from 'path'

// Routes
import courses from './routes/courses'
import generate from './routes/generate'
import exportCourse from './routes/export'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors())

// API Routes
app.route('/api/courses', courses)
app.route('/api/generate', generate)
app.route('/api/export', exportCourse)

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

// Serve static assets from frontend/dist/assets
app.use('/assets/*', serveStatic({ root: './frontend/dist' }))

// Serve favicon
app.use('/favicon.svg', serveStatic({ root: './frontend/dist' }))

// SPA fallback - serve index.html for all other routes
app.get('*', (c) => {
  try {
    const indexPath = join(process.cwd(), 'frontend', 'dist', 'index.html')
    const indexHtml = readFileSync(indexPath, 'utf-8')
    return c.html(indexHtml)
  } catch {
    return c.html(`<!DOCTYPE html>
<html lang="en">
<head><title>Course Creator</title></head>
<body>
<div id="app"></div>
<p>Loading...</p>
</body>
</html>`)
  }
})

const port = process.env.PORT ? parseInt(process.env.PORT) : 3001

serve({
  fetch: app.fetch,
  port
})

console.log(`Course Creator API running on port ${port}`)