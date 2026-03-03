<script>
  import { onMount } from 'svelte'
  import CourseEditor from './components/CourseEditor.svelte'
  import CourseList from './components/CourseList.svelte'
  import { courseStore } from './stores/course.js'

  // Use store's loading state instead of local state
  let initialized = $state(false)

  onMount(async () => {
    await courseStore.loadCourses()
    initialized = true
  })

  // Current course from store (already reactive via $store syntax)
  // No $derived needed - $courseStore.current is already reactive
</script>

<main class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
  {#if !initialized}
    <div class="flex items-center justify-center min-h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  {:else if $courseStore.courses.length === 0}
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900">📚 Course Creator</h1>
        <nav class="flex gap-4">
          <button
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            onclick={() => { courseStore.newCourse() }}
          >
            + New Course
          </button>
        </nav>
      </div>
    </header>
    <div class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <CourseList
        courses={$courseStore.courses}
        oncreate={() => courseStore.newCourse()}
        onedit={(e) => { courseStore.selectCourse(e.detail) }}
      />
    </div>
  {:else}
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900">📚 Course Creator</h1>
        <nav class="flex gap-4">
          <button
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            onclick={() => { courseStore.newCourse() }}
          >
            + New Course
          </button>
        </nav>
      </div>
    </header>
    <div class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <CourseList
        courses={$courseStore.courses}
        oncreate={() => courseStore.newCourse()}
        onedit={(e) => { courseStore.selectCourse(e.detail) }}
      />
    </div>
  {/if}
</main>

{#if $courseStore.current}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
      <CourseEditor
        course={$courseStore.current}
        onsave={async () => {
          await courseStore.saveCourse()
        }}
        oncancel={() => courseStore.selectCourse(null)}
      />
    </div>
  </div>
{/if}