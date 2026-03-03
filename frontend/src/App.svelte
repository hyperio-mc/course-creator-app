<script>
  import { onMount } from 'svelte'
  import AppHeader from './components/AppHeader.svelte'
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

<main class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
  {#if !initialized}
    <div class="flex items-center justify-center min-h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
    </div>
  {:else}
    <AppHeader onNewCourse={() => courseStore.newCourse()} />
    <div class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <CourseList
        courses={$courseStore.courses}
        oncreate={() => courseStore.newCourse()}
        onedit={(course) => { courseStore.selectCourse(course) }}
      />
    </div>
  {/if}
</main>

{#if $courseStore.current}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
      <CourseEditor
        course={$courseStore.current}
        onsave={async (editedCourse) => {
          await courseStore.saveCourse(editedCourse)
        }}
        oncancel={() => courseStore.selectCourse(null)}
      />
    </div>
  </div>
{/if}
