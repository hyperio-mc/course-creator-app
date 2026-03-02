<script>
  export let courses = []
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }
</script>

<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {#each courses as course (course.id)}
    <div class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
      <div class="p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">{course.meta.title}</h3>
        <p class="text-gray-600 text-sm mb-4 line-clamp-2">{course.meta.description || 'No description'}</p>
        <div class="flex gap-4 text-sm text-gray-500 mb-4">
          <span>📝 {course.steps.length} steps</span>
          <span>⏱️ {course.meta.estimatedTime}</span>
        </div>
        <div class="flex gap-2">
          <button
            class="flex-1 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition text-sm font-medium"
            on:click={() => dispatch('edit', course)}
          >
            Edit
          </button>
          <button
            class="px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition text-sm font-medium"
            on:click={() => window.open(`/api/export/${course.id}/html`, '_blank')}
          >
            Preview
          </button>
        </div>
      </div>
      <div class="px-6 py-3 bg-gray-50 text-xs text-gray-500">
        Updated {formatDate(course.updatedAt)}
      </div>
    </div>
  {:else}
    <div class="col-span-full text-center py-12">
      <div class="text-gray-400 text-6xl mb-4">📚</div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
      <p class="text-gray-500 mb-4">Create your first course to get started</p>
      <button
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        on:click={() => dispatch('create')}
      >
        Create Course
      </button>
    </div>
  {/each}
</div>