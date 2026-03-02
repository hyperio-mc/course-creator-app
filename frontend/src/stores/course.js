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
          difficulty: 'beginner'
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

  async function saveCourse() {
    const state = get()
    if (!state.current) return

    update(s => ({ ...s, loading: true, error: null }))

    try {
      const existing = state.courses.find(c => c.id === state.current.id)
      const url = existing
        ? `${API_BASE}/courses/${state.current.id}`
        : `${API_BASE}/courses`
      const method = existing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meta: state.current.meta, steps: state.current.steps, resources: state.current.resources })
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

  return { subscribe, set, update, loadCourses, newCourse, selectCourse, saveCourse }
}

export const courseStore = createCourseStore()

// Helper to get current state
function get() {
  let state
  courseStore.subscribe(s => state = s)()
  return state
}