# Course Creator App

> Create interactive video courses from transcripts

Web application for building video-driven courses with AI assistance.

## Features

- 🎥 **Video Integration** - YouTube, Loom, Vimeo support with timestamp navigation
- 🤖 **AI Generation** - Generate course structure from transcript via ScoutOS
- ✏️ **Visual Editor** - Edit steps, content, and checkpoints in real-time
- 📦 **Export** - Generate standalone HTML or deploy to ZenBin
- 💾 **Cloud Storage** - Courses stored in LMDB on Railway

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Svelte SPA    │────▶│   Hono API      │────▶│    LMDB        │
│   (Frontend)    │     │   (Backend)     │     │   (Storage)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │   ScoutOS       │
                        │   (AI Agent)    │
                        └─────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+
- Bun (for backend)

### Development

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Run backend
npm run dev

# Run frontend (in another terminal)
npm run frontend:dev
```

### Environment Variables

```bash
SCOUTOS_API_KEY=your_scoutos_api_key
LMDB_PATH=./data/courses.lmdb
PORT=3001
```

## API

### Courses

- `GET /api/courses` - List all courses
- `POST /api/courses` - Create new course
- `GET /api/courses/:id` - Get course by ID or slug
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Generation

- `POST /api/generate` - Generate course from video URL + transcript
- `POST /api/generate/:id/deploy` - Deploy to ZenBin

### Export

- `GET /api/export/:id/html` - Get HTML
- `GET /api/export/:id/json` - Get JSON
- `GET /api/export/:id/download` - Download as file

## Course JSON Schema

```json
{
  "id": "uuid",
  "slug": "course-slug",
  "meta": {
    "title": "Course Title",
    "description": "Brief description",
    "author": "Author Name",
    "estimatedTime": "15 minutes",
    "difficulty": "beginner"
  },
  "steps": [
    {
      "id": "step-1",
      "title": "Step Title",
      "videoUrl": "https://youtube.com/watch?v=...",
      "videoTimestamp": "0:30",
      "videoEndTimestamp": "2:00",
      "content": "Markdown content...",
      "estimatedTime": "5 minutes",
      "checkpoint": {
        "label": "I completed this step",
        "hint": "Help text"
      }
    }
  ],
  "resources": [
    {
      "label": "Resource Name",
      "url": "https://..."
    }
  ]
}
```

## Deployment

### Railway

```bash
railway login
railway init
railway up
```

### OnHyper

Build the frontend and upload as a static app:

```bash
cd frontend
npm run build
cd ..
# Upload dist/ to OnHyper
```

## Roadmap

- [ ] User authentication
- [ ] Course templates
- [ ] Multi-language support
- [ ] Analytics dashboard
- [ ] Version history

## License

MIT