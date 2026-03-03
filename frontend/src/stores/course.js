import { writable } from 'svelte/store'
import { v4 as uuid } from 'uuid'

const API_BASE = '/api'

function createCourseStore() {
  const { subscribe, set, update } = writable({
    courses: [],
    current: null,
    loading: false,
    error: null
  })

  async function loadCourses() {
    update(s => ({ ...s, loading: true, error: null }))
    try {
      const res = await fetch(`${API_BASE}/courses`)
      const data = await res.json()
      update(s => ({ ...s, courses: data.courses || [], loading: false }))
    } catch (error) {
      update(s => ({ ...s, error: error.message, loading: false }))
    }
  }

  function newCourse() {
    update(s => ({
      ...s,
      current: {
        id: uuid(),
        slug: '',
        meta: {
          title: '',
          description: '',
          author: '',
          estimatedTime: '15 minutes',
          difficulty: 'beginner',
          status: 'draft'
        },
        steps: [],
        resources: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }))
  }

  function selectCourse(course) {
    update(s => ({ ...s, current: course }))
  }

  async function saveCourse(courseData) {
    // Accept course data as parameter, or fall back to store's current
    const state = get()
    const courseToSave = courseData || state.current
    if (!courseToSave) return

    update(s => ({ ...s, loading: true, error: null }))

    try {
      const existing = state.courses.find(c => c.id === courseToSave.id)
      const url = existing
        ? `${API_BASE}/courses/${courseToSave.id}`
        : `${API_BASE}/courses`
      const method = existing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meta: courseToSave.meta, steps: courseToSave.steps, resources: courseToSave.resources })
      })

      const data = await res.json()

      if (existing) {
        update(s => ({
          ...s,
          courses: s.courses.map(c => c.id === data.course.id ? data.course : c),
          current: null,
          loading: false
        }))
      } else {
        update(s => ({
          ...s,
          courses: [data.course, ...s.courses],
          current: null,
          loading: false
        }))
      }
    } catch (error) {
      update(s => ({ ...s, error: error.message, loading: false }))
    }
  }

  async function publishCourse(courseId) {
    const state = get()
    const course = state.courses.find(c => c.id === courseId)
    if (!course) return

    update(s => ({ ...s, loading: true, error: null }))

    try {
      const res = await fetch(`${API_BASE}/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meta: { ...course.meta, status: 'published' },
          steps: course.steps,
          resources: course.resources
        })
      })

      const data = await res.json()

      update(s => ({
        ...s,
        courses: s.courses.map(c => c.id === data.course.id ? data.course : c),
        loading: false
      }))
    } catch (error) {
      update(s => ({ ...s, error: error.message, loading: false }))
    }
  }

  async function deleteCourse(courseId) {
    update(s => ({ ...s, loading: true, error: null }))

    try {
      const res = await fetch(`${API_BASE}/courses/${courseId}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        throw new Error(`Failed to delete course (${res.status})`)
      }

      update(s => ({
        ...s,
        courses: s.courses.filter(c => c.id !== courseId),
        current: s.current?.id === courseId ? null : s.current,
        loading: false
      }))

      return { success: true }
    } catch (error) {
      update(s => ({ ...s, error: error.message, loading: false }))
      return { success: false, error: error.message }
    }
  }

  return { subscribe, set, update, loadCourses, newCourse, selectCourse, saveCourse, publishCourse, deleteCourse }
}

export const courseStore = createCourseStore()

// Helper to get current state
function get() {
  let state
  courseStore.subscribe(s => state = s)()
  return state
}
