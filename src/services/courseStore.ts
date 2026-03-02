import { open } from 'lmdb'
import type { Course } from '../types/course'

const LMDB_PATH = process.env.LMDB_PATH || './data/courses.lmdb'

let db: ReturnType<typeof open> | null = null

export function getDB() {
  if (!db) {
    db = open({
      path: LMDB_PATH
    })
  }
  return db
}

export async function createCourse(course: Course): Promise<Course> {
  const db = getDB()
  await db.put(`course:${course.id}`, course)
  await db.put(`slug:${course.slug}`, course.id)
  return course
}

export async function getCourse(id: string): Promise<Course | null> {
  const db = getDB()
  const course = await db.get(`course:${id}`)
  return course as Course | null
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const db = getDB()
  const id = await db.get(`slug:${slug}`)
  if (!id) return null
  return getCourse(id as string)
}

export async function updateCourse(id: string, updates: Partial<Course>): Promise<Course | null> {
  const db = getDB()
  const existing = await getCourse(id)
  if (!existing) return null
  
  const updated: Course = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  await db.put(`course:${id}`, updated)
  return updated
}

export async function deleteCourse(id: string): Promise<boolean> {
  const db = getDB()
  const course = await getCourse(id)
  if (!course) return false
  
  await db.remove(`course:${id}`)
  await db.remove(`slug:${course.slug}`)
  return true
}

export async function listCourses(): Promise<Course[]> {
  const db = getDB()
  const courses: Course[] = []
  
  for await (const { key, value } of db.getRange({ start: 'course:' })) {
    if (typeof key === 'string' && key.startsWith('course:')) {
      courses.push(value as Course)
    }
  }
  
  return courses.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50) + '-' + Date.now().toString(36)
}