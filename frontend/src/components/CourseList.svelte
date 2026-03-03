<script>
  import { courseStore } from '../stores/course.js'

  // Use callback props in Svelte 5 runes mode
  let { courses = [], oncreate, onedit } = $props()

  let deleteMessage = $state(null)

  async function handleDelete(course) {
    const title = course.meta?.title?.trim() || 'Untitled Course'
    const confirmed = confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)
    if (!confirmed) return

    const result = await courseStore.deleteCourse(course.id)
    if (result.success) {
      deleteMessage = { type: 'success', text: `"${title}" has been deleted.` }
    } else {
      deleteMessage = { type: 'error', text: `Failed to delete "${title}": ${result.error}` }
    }
    setTimeout(() => deleteMessage = null, 4000)
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  function getStatus(course) {
    return course.meta?.status === 'published' ? 'published' : 'draft'
  }

  function getStatusClasses(status) {
    switch (status.toLowerCase()) {
      case 'published':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
      default:
        return 'bg-slate-100 text-slate-700 ring-slate-500/20'
    }
  }

  function getStatusLabel(status) {
    return status === 'published' ? 'Published' : 'Draft'
  }

  function isReadyToPublish(course) {
    return Boolean(course.meta?.title?.trim()) && course.steps.length > 0
  }

  function getCompletion(course) {
    let score = 0
    if (course.meta?.title?.trim()) score += 1
    if (course.meta?.description?.trim()) score += 1
    if (course.steps.length > 0) score += 2
    if (course.resources?.length > 0) score += 1
    return Math.round((score / 5) * 100)
  }

  function exportCourse(courseId) {
    window.open(`/api/export/${courseId}/download?format=html`, '_blank')
  }

  function viewCourse(courseId) {
    window.open(`/api/export/${courseId}/html`, '_blank')
  }

  async function publishCourse(courseId) {
    await courseStore.publishCourse(courseId)
  }
</script>

{#if deleteMessage}
  <div class={`mb-4 rounded-lg px-4 py-3 text-sm font-medium ${deleteMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
    {deleteMessage.text}
  </div>
{/if}

<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {#each courses as course (course.id)}
    {@const status = getStatus(course)}
    {@const completion = getCompletion(course)}
    {@const readyToPublish = isReadyToPublish(course)}
    {@const canPublish = status !== 'published'}
    <article class="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg">
      <div class="relative border-b border-slate-200 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 px-6 py-5">
        <div class="absolute right-6 top-5">
          <span class={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset ${getStatusClasses(status)}`}>
            {getStatusLabel(status)}
          </span>
        </div>
        <div class="mb-4 flex items-start gap-3 pr-24">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-600 text-sm font-bold text-white">
            {course.meta.title?.trim()?.slice(0, 2).toUpperCase() || 'CR'}
          </div>
          <div>
            <h3 class="text-xl font-semibold leading-tight text-slate-900">{course.meta.title || 'Untitled Course'}</h3>
            <p class="mt-1 text-sm font-medium text-slate-500">Updated {formatDate(course.updatedAt)}</p>
          </div>
        </div>
        <p class="min-h-[2.75rem] text-sm leading-relaxed text-slate-600 line-clamp-2">
          {course.meta.description || 'Add a short course summary to help learners understand the objective.'}
        </p>
      </div>

      <div class="px-6 py-5">
        <div class="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Workflow</p>
          <p class="mt-1 text-sm font-medium text-slate-700">Draft &rarr; Published</p>
        </div>

        <div class="mb-5 grid grid-cols-2 gap-3 text-sm">
          <div class="rounded-lg bg-slate-50 px-3 py-2">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Structure</p>
            <p class="mt-1 font-semibold text-slate-900">{course.steps.length} steps</p>
          </div>
          <div class="rounded-lg bg-slate-50 px-3 py-2">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Estimated Time</p>
            <p class="mt-1 font-semibold text-slate-900">{course.meta.estimatedTime || 'TBD'}</p>
          </div>
        </div>

        <div class="mb-5">
          <div class="mb-2 flex items-center justify-between">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Course completion</p>
            <p class="text-sm font-semibold text-slate-700">{completion}%</p>
          </div>
          <div class="h-2 rounded-full bg-slate-100">
            <div
              class="h-2 rounded-full bg-orange-600 transition-all duration-300"
              style={`width: ${completion}%`}
            ></div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <button
            class="rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
            onclick={() => onedit?.(course)}
          >
            Edit
          </button>
          <button
            class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            onclick={() => viewCourse(course.id)}
          >
            View
          </button>
          <button
            class="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            onclick={() => exportCourse(course.id)}
          >
            Export
          </button>
          <button
            class={`rounded-lg px-3 py-2 text-sm font-semibold transition ${canPublish ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'cursor-not-allowed bg-emerald-100 text-emerald-700'}`}
            onclick={() => canPublish && publishCourse(course.id)}
            disabled={!canPublish}
          >
            {#if canPublish}
              {readyToPublish ? 'Publish' : 'Save & Publish'}
            {:else}
              Published
            {/if}
          </button>
          <button
            class="col-span-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50"
            onclick={() => handleDelete(course)}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  {:else}
    <div class="col-span-full text-center py-12">
      <div class="text-gray-400 text-6xl mb-4">📚</div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
      <p class="text-gray-500 mb-4">Create your first course to get started</p>
      <button
        class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
        onclick={() => oncreate?.()}
      >
        Create Course
      </button>
    </div>
  {/each}
</div>
