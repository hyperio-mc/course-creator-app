<script>
  import { onMount } from 'svelte'
  import CourseEditor from './components/CourseEditor.svelte'
  import CourseList from './components/CourseList.svelte'
  import { courseStore } from './stores/course.js'

  let view = 'list' // 'list' | 'create' | 'edit'
  let loading = true

  onMount(async () => {
    await courseStore.loadCourses()
    loading = false
  })
</script>

<main class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
  {#if loading}
    <div class="flex items-center justify-center min-h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  {:else}
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900 cursor-pointer" on:click={() => view = 'list'}>
          📚 Course Creator
        </h1>
        <nav class="flex gap-4">
          <button
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            on:click={() => { view = 'create'; courseStore.newCourse() }}
          >
            + New Course
          </button>
        </nav>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {#if view === 'list'}
        <CourseList
          courses={$courseStore.courses}
          on:create={() => view = 'create'}
          on:edit={(e) => { courseStore.selectCourse(e.detail); view = 'edit' }}
        />
      {:else}
        <CourseEditor
          course=$courseStore.current
          on:save={async () => {
            await courseStore.saveCourse()
            view = 'list'
          }}
          on:cancel={() => view = 'list'}
        />
      {/if}
    </div>
  {/if}
</main>