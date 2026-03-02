<script>
  import { createEventDispatcher } from 'svelte'
  import StepEditor from './StepEditor.svelte'
  const dispatch = createEventDispatcher()

  // Use $props() in Svelte 5 runes mode
  let { course: courseProp } = $props()

  // Create local reactive state with default if prop is null
  let course = $state(courseProp ?? {
    meta: { title: '', description: '', author: '', estimatedTime: '15 minutes', difficulty: 'beginner' },
    steps: [],
    resources: []
  })

  // Sync when prop changes
  $effect(() => {
    if (courseProp && courseProp.id) {
      course = courseProp
    }
  })

  function addStep() {
    course = {
      ...course,
      steps: [...course.steps, {
        id: `step-${Date.now()}`,
        title: '',
        videoUrl: '',
        videoTimestamp: '0:00',
        content: '',
        estimatedTime: '5 minutes',
        checkpoint: { label: 'I completed this step' }
      }]
    }
  }

  function removeStep(index) {
    course = {
      ...course,
      steps: course.steps.filter((_, i) => i !== index)
    }
  }

  function updateStep(index, step) {
    const newSteps = [...course.steps]
    newSteps[index] = step
    course = { ...course, steps: newSteps }
  }

  function addResource() {
    course = {
      ...course,
      resources: [...(course.resources || []), { label: '', url: '' }]
    }
  }

  function removeResource(index) {
    course = {
      ...course,
      resources: course.resources.filter((_, i) => i !== index)
    }
  }

  async function generateFromTranscript() {
    alert('AI generation coming soon! For now, manually add steps.')
  }
</script>

<div class="bg-white rounded-xl shadow-sm">
  <!-- Header -->
  <div class="p-6 border-b">
    <h2 class="text-xl font-semibold text-gray-900 mb-4">
      {course?.id ? 'Edit Course' : 'New Course'}
    </h2>

    <!-- Meta fields -->
    <div class="grid gap-4 md:grid-cols-2">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          bind:value={course.meta.title}
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Course title"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Author</label>
        <input
          type="text"
          bind:value={course.meta.author}
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Your name"
        />
      </div>
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          bind:value={course.meta.description}
          rows="2"
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Brief description of the course"
        ></textarea>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Estimated Time</label>
        <input
          type="text"
          bind:value={course.meta.estimatedTime}
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="e.g., 15 minutes"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
        <select
          bind:value={course.meta.difficulty}
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
    </div>
  </div>

  <!-- AI Generation -->
  <div class="p-6 bg-indigo-50 border-b">
    <button
      class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
      onclick={() => generateFromTranscript()}
    >
      <span>✨</span>
      <span>Generate from Transcript (AI)</span>
    </button>
  </div>

  <!-- Steps -->
  <div class="p-6 border-b">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-gray-900">Steps</h3>
      <button
        class="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
        onclick={() => addStep()}
      >
        + Add Step
      </button>
    </div>

    <div class="space-y-4">
      {#each course.steps as step, index (step.id)}
        <StepEditor
          {step}
          {index}
          onupdate={(e) => updateStep(index, e.detail)}
          onremove={() => removeStep(index)}
        />
      {/each}
    </div>

    {#if course.steps.length === 0}
      <p class="text-gray-500 text-center py-8">
        No steps yet. Add your first step above or generate from a transcript.
      </p>
    {/if}
  </div>

  <!-- Resources -->
  <div class="p-6 border-b">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-gray-900">Resources</h3>
      <button
        class="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
        onclick={() => addResource()}
      >
        + Add Resource
      </button>
    </div>

    <div class="space-y-3">
      {#each course.resources || [] as resource, index}
        <div class="flex gap-3">
          <input
            type="text"
            bind:value={resource.label}
            class="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="Resource name"
          />
          <input
            type="url"
            bind:value={resource.url}
            class="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="https://..."
          />
          <button
            class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            onclick={() => removeResource(index)}
          >
            ✕
          </button>
        </div>
      {/each}
    </div>
  </div>

  <!-- Actions -->
  <div class="p-6 flex justify-between">
    <button
      class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
      onclick={() => dispatch('cancel')}
    >
      Cancel
    </button>
    <div class="flex gap-3">
      <button
        class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
        onclick={() => window.open('/api/export/' + course.id + '/html', '_blank')}
      >
        Preview
      </button>
      <button
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        onclick={() => dispatch('save')}
      >
        Save Course
      </button>
    </div>
  </div>
</div>