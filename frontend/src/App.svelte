<script>
  import { onMount } from 'svelte'
  import CourseEditor from './components/CourseEditor.svelte'
  import CourseList from './components/CourseList.svelte'
  import { courseStore } from './stores/course.js'

  let view = $state('list') // 'list' | 'create' | 'edit'
  let loading = $state(true)

  onMount(async () => {
    await courseStore.loadCourses()
    loading = false
  })

  // Derived value for the current course (never null when editing)
  let currentCourse = $derived($courseStore.current)
</script>

<main class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
  {#if loading}
    <div class="flex items-center justify-center min-h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  {:else if view === 'list'}
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900 cursor-pointer" onclick={() => view = 'list'}>
          📚 Course Creator
        </h1>
        <nav class="flex gap-4">
          <button
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            onclick={() => { view = 'create'; courseStore.newCourse() }}
          >
            + New Course
          </button>
        </nav>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <CourseList
        courses={$courseStore.courses}
        oncreate={() => view = 'create'}
        onedit={(e) => { courseStore.selectCourse(e.detail); view = 'edit' }}
      />
    </div>
  {:else if currentCourse}
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900 cursor-pointer" onclick={() => view = 'list'}>
          📚 Course Creator
        </h1>
        <nav class="flex gap-4">
          <button
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            onclick={() => { view = 'create'; courseStore.newCourse() }}
          >
            + New Course
          </button>
        </nav>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <CourseEditor
        course={currentCourse}
        onsave={async () => {
          await courseStore.saveCourse()
          view = 'list'
        }}
        oncancel={() => view = 'list'}
      />
    </div>
  {/if}
</main>