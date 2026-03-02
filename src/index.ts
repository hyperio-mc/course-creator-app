import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'

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

// SPA fallback
app.get('*', (c) => c.html(`<!DOCTYPE html>
<html>
<head><title>Course Creator</title></head>
<body>
<div id="app"></div>
<script type="module" src="/frontend/dist/index.js"></script>
</body>
</html>`))

const port = process.env.PORT ? parseInt(process.env.PORT) : 3001

serve({
  fetch: app.fetch,
  port
})

console.log(`Course Creator API running on port ${port}`)