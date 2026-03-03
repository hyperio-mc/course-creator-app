<script>
  import StepEditor from './StepEditor.svelte'

  // Use $props() in Svelte 5 runes mode
  // course must be passed from parent - parent handles null case
  let { course: initialCourse, onsave, oncancel } = $props()

  // Deep clone the course so edits don't mutate the original
  let course = $state(JSON.parse(JSON.stringify(initialCourse)))

  // Form validation state
  let validationErrors = $state([])
  let saving = $state(false)

  // AI Generation state
  let showGenerateModal = $state(false)
  let generateVideoUrl = $state('')
  let generateTranscript = $state('')
  let generating = $state(false)
  let generateError = $state('')

  function validate() {
    const errors = []
    if (!course.meta.title?.trim()) {
      errors.push('Course title is required')
    }
    if (!course.meta.author?.trim()) {
      errors.push('Author name is required')
    }
    return errors
  }

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

  async function handleSave() {
    validationErrors = validate()
    if (validationErrors.length > 0) return

    saving = true
    try {
      await onsave?.(course)
    } finally {
      saving = false
    }
  }

  function handleCancel() {
    oncancel?.()
  }

  async function generateFromTranscript() {
    showGenerateModal = true
  }

  async function doGenerate() {
    if (!generateVideoUrl || !generateTranscript) {
      generateError = 'Video URL and transcript are required'
      return
    }

    generating = true
    generateError = ''

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: generateVideoUrl,
          transcript: generateTranscript,
          meta: {
            title: course.meta.title || 'Untitled Course',
            description: course.meta.description,
            author: course.meta.author
          }
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Generation failed')
      }

      // Update the course with generated content
      course = {
        ...course,
        id: data.course.id,
        slug: data.course.slug,
        meta: { ...course.meta, ...data.course.meta },
        steps: data.course.steps,
        resources: data.course.resources
      }

      // Close modal and reset
      showGenerateModal = false
      generateVideoUrl = ''
      generateTranscript = ''
    } catch (err) {
      generateError = err.message
    } finally {
      generating = false
    }
  }
</script>

<div class="bg-white rounded-xl shadow-sm">
  <!-- Header -->
  <div class="p-6 border-b">
    <h2 class="text-xl font-semibold text-gray-900 mb-4">
      {initialCourse?.id && !initialCourse.id.startsWith('step-') ? 'Edit Course' : 'New Course'}
    </h2>

    <!-- Validation Errors -->
    {#if validationErrors.length > 0}
      <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm font-medium text-red-800 mb-1">Please fix the following:</p>
        <ul class="list-disc list-inside text-sm text-red-700">
          {#each validationErrors as error}
            <li>{error}</li>
          {/each}
        </ul>
      </div>
    {/if}

    <!-- Meta fields -->
    <div class="grid gap-4 md:grid-cols-2">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Title <span class="text-red-500">*</span>
        </label>
        <input
          type="text"
          bind:value={course.meta.title}
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          class:border-red-300={validationErrors.some(e => e.includes('title'))}
          placeholder="Course title"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Author <span class="text-red-500">*</span>
        </label>
        <input
          type="text"
          bind:value={course.meta.author}
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          class:border-red-300={validationErrors.some(e => e.includes('Author'))}
          placeholder="Your name"
        />
      </div>
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          bind:value={course.meta.description}
          rows="2"
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Brief description of the course"
        ></textarea>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Estimated Time</label>
        <input
          type="text"
          bind:value={course.meta.estimatedTime}
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="e.g., 15 minutes"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
        <select
          bind:value={course.meta.difficulty}
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
    </div>
  </div>

  <!-- AI Generation -->
  <div class="p-6 bg-orange-50 border-b">
    <button
      class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center gap-2"
      onclick={() => generateFromTranscript()}
    >
      <span>&#10024;</span>
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
          onupdate={(updatedStep) => updateStep(index, updatedStep)}
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
             class="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            placeholder="Resource name"
          />
          <input
            type="url"
            bind:value={resource.url}
             class="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            placeholder="https://..."
          />
          <button
            class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            onclick={() => removeResource(index)}
          >
            &#10005;
          </button>
        </div>
      {/each}
    </div>
  </div>

  <!-- Actions -->
  <div class="p-6 flex justify-between">
      <button
        type="button"
        class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
        onclick={handleCancel}
      >
        Cancel
      </button>
    <div class="flex gap-3">
      <button
        type="button"
        class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
        onclick={() => window.open('/api/export/' + course.id + '/html', '_blank')}
      >
        Preview
      </button>
      <button
        type="button"
        class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        onclick={handleSave}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Course'}
      </button>
    </div>
  </div>
</div>

<!-- Generate Modal -->
{#if showGenerateModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
    <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
      <div class="p-6 border-b">
        <h2 class="text-xl font-semibold text-gray-900">&#10024; Generate Course from Transcript</h2>
        <p class="text-gray-600 mt-1">Paste a video URL and transcript to auto-generate course content.</p>
      </div>
      
      <div class="p-6 space-y-4">
        {#if generateError}
          <div class="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {generateError}
          </div>
        {/if}
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
          <input
            type="url"
            bind:value={generateVideoUrl}
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            placeholder="https://youtube.com/watch?v=... or https://loom.com/share/..."
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Transcript</label>
          <textarea
            bind:value={generateTranscript}
            rows="10"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            placeholder="Paste your video transcript here..."
          ></textarea>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <strong>Tip:</strong> Use YouTube's auto-generated captions, Loom transcripts, or Descript exports. The AI will structure the content into steps with checkpoints.
        </div>
      </div>
      
      <div class="p-6 border-t flex justify-end gap-3">
        <button
          class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          onclick={() => { showGenerateModal = false; generateError = '' }}
          disabled={generating}
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          onclick={doGenerate}
          disabled={generating}
        >
          {#if generating}
            <span class="animate-spin">&#9203;</span>
            <span>Generating...</span>
          {:else}
            <span>&#10024;</span>
            <span>Generate Course</span>
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}
