# Course Creator App - Implementation Plan

## Overview
Web app version of `twilson63/course-creator` CLI. Users can create interactive video courses from transcripts through a browser interface.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    course-creator-app                        │
├─────────────────────────────────────────────────────────────┤
│  Frontend (OnHyper)                                         │
│  - Svelte SPA                                               │
│  - Course editor UI                                         │
│  - Video preview (YouTube, Loom, Vimeo embeds)              │
│  - Step-by-step course builder                              │
│  - Live preview                                             │
├─────────────────────────────────────────────────────────────┤
│  Backend (Railway)                                          │
│  - Hono API server                                          │
│  - Course CRUD                                              │
│  - AI processing via ScoutOS                                │
│  - LMDB storage for courses                                 │
│  - Export to HTML                                           │
├─────────────────────────────────────────────────────────────┤
│  Integrations                                               │
│  - ScoutOS Agent (transcript parsing, course generation)     │
│  - ZenBin (course hosting)                                  │
│  - OnHyper (app hosting)                                    │
└─────────────────────────────────────────────────────────────┘
```

## Core Features

### MVP (Today)
1. **Course Editor**
   - Input video URL (YouTube, Loom, Vimeo, Descript)
   - Paste transcript
   - AI generates course structure (via ScoutOS)
   - Edit steps, content, checkpoints
   
2. **Live Preview**
   - See course as you build it
   - Test video embeds
   - Verify timestamps

3. **Export**
   - Generate standalone HTML
   - Deploy to ZenBin
   - Share link

4. **Course Library**
   - List created courses
   - Edit/update existing courses
   - Delete courses

### Future
- User authentication
- Course templates
- Multi-language support
- Analytics
- Version history

## Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| Frontend | Svelte + Vite | Fast, lightweight, OnHyper compatible |
| Backend | Hono + TypeScript | Same stack as OnHyper |
| Database | LMDB | Fast, embedded, works on Railway volumes |
| AI | ScoutOS Agent | Tom's platform for transcript processing |
| Hosting | OnHyper (frontend) + Railway (backend) | Proven stack |

## API Endpoints

### Courses
- `GET /api/courses` - List all courses
- `POST /api/courses` - Create new course
- `GET /api/courses/:id` - Get course by ID
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### AI Processing
- `POST /api/courses/generate` - Generate course from transcript + video URL
- `POST /api/courses/:id/export` - Export to HTML
- `POST /api/courses/:id/deploy` - Deploy to ZenBin

## File Structure

```
course-creator-app/
├── src/
│   ├── index.ts          # Hono server entry
│   ├── routes/
│   │   ├── courses.ts    # Course CRUD
│   │   ├── generate.ts   # AI generation (ScoutOS)
│   │   └── export.ts     # HTML export
│   ├── services/
│   │   ├── courseStore.ts    # LMDB course storage
│   │   ├── scoutos.ts        # ScoutOS API client
│   │   └── template.ts       # HTML template generation
│   └── types/
│       └── course.ts
├── frontend/              # Svelte app
│   ├── src/
│   │   ├── App.svelte
│   │   ├── components/
│   │   │   ├── CourseEditor.svelte
│   │   │   ├── StepEditor.svelte
│   │   │   ├── VideoPreview.svelte
│   │   │   └── LivePreview.svelte
│   │   └── stores/
│   │       └── course.ts
│   └── index.html
├── package.json
├── railway.toml
└── README.md
```

## Deployment Strategy

1. **Railway Setup**
   - Create new Railway project
   - Add volume for LMDB storage
   - Deploy backend service

2. **OnHyper Publishing**
   - Build Svelte frontend
   - Upload to OnHyper as course-creator.onhyper.io

3. **Environment Variables**
   - SCOUTOS_API_KEY (from TOOLS.md)
   - ZENBIN_API_URL
   - LMDB_PATH (Railway volume)

## Tasks

### Phase 1: Foundation (2 hours)
- [ ] Initialize project structure
- [ ] Set up Hono backend
- [ ] Create LMDB course store
- [ ] Basic course CRUD API

### Phase 2: AI Integration (1 hour)
- [ ] ScoutOS API client
- [ ] Transcript parsing prompt
- [ ] Course generation from transcript

### Phase 3: Frontend (2 hours)
- [ ] Svelte boilerplate
- [ ] Course editor components
- [ ] Video preview
- [ ] Live preview

### Phase 4: Export & Deploy (1 hour)
- [ ] HTML template engine
- [ ] ZenBin deployment
- [ ] End-to-end test

### Phase 5: polish (30 min)
- [ ] Error handling
- [ ] Loading states
- [ ] Documentation

## Success Criteria

1. User can paste a YouTube URL + transcript
2. AI generates a structured course
3. User can edit steps and preview
4. One-click export to working HTML
5. Deployed to Railway + OnHyper
6. Repo pushed to twilson63/course-creator-app