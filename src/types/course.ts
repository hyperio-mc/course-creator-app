export interface CourseMeta {
  title: string
  description: string
  author: string
  estimatedTime: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export interface Checkpoint {
  label: string
  hint?: string
}

export interface Step {
  id: string
  title: string
  videoUrl: string
  videoTimestamp: string
  videoEndTimestamp?: string
  content: string
  estimatedTime: string
  checkpoint: Checkpoint
}

export interface Resource {
  label: string
  url: string
}

export interface Course {
  id: string
  slug: string
  meta: CourseMeta
  steps: Step[]
  resources: Resource[]
  createdAt: string
  updatedAt: string
  zenbinId?: string
  zenbinUrl?: string
}

export interface CourseInput {
  meta: CourseMeta
  steps: Omit<Step, 'id'>[]
  resources?: Resource[]
}

export interface GenerateCourseInput {
  videoUrl: string
  transcript: string
  meta: Partial<CourseMeta>
}

export interface GenerateCourseOutput {
  course: Course
}