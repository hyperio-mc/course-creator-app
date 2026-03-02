<script>
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  export let step
  export let index

  $: collapsed = index > 0 && !step.title

  function extractVideoId(url) {
    if (!url) return null
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/)
    return ytMatch ? ytMatch[1] : null
  }

  $: videoId = extractVideoId(step.videoUrl)
</script>

<div class="border rounded-lg overflow-hidden">
  <!-- Header -->
  <div
    class="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
    on:click={() => collapsed = !collapsed}
  >
    <div class="flex items-center gap-3">
      <span class="text-gray-400 text-lg font-mono">{index + 1}</span>
      <span class="font-medium text-gray-900">{step.title || 'Untitled Step'}</span>
      {#if step.estimatedTime}
        <span class="text-sm text-gray-500">({step.estimatedTime})</span>
      {/if}
    </div>
    <div class="flex items-center gap-2">
      {#if collapsed}
        <span class="text-gray-400">▼</span>
      {:else}
        <span class="text-gray-400">▲</span>
      {/if}
    </div>
  </div>

  {#if !collapsed}
    <div class="p-4 space-y-4">
      <!-- Video URL & Timestamp -->
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
          <input
            type="url"
            bind:value={step.videoUrl}
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>
        <div class="flex gap-2">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Start</label>
            <input
              type="text"
              bind:value={step.videoTimestamp}
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="0:00"
            />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">End (opt)</label>
            <input
              type="text"
              bind:value={step.videoEndTimestamp}
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="2:30"
            />
          </div>
        </div>
      </div>

      <!-- Video Preview -->
      {#if videoId}
        <div class="aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            src="https://www.youtube.com/embed/{videoId}"
            class="w-full h-full"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      {/if}

      <!-- Title -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Step Title</label>
        <input
          type="text"
          bind:value={step.title}
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          placeholder="What learners will do in this step"
        />
      </div>

      <!-- Content -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Content (Markdown)</label>
        <textarea
          bind:value={step.content}
          rows="6"
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
          placeholder="## What you'll do&#10;&#10;- First step&#10;- Second step&#10;&#10;## Tips&#10;&#10;- Tip 1&#10;- Tip 2"
        ></textarea>
      </div>

      <!-- Estimated Time & Checkpoint -->
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Estimated Time</label>
          <input
            type="text"
            bind:value={step.estimatedTime}
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="5 minutes"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Checkpoint</label>
          <input
            type="text"
            bind:value={step.checkpoint.label}
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="I completed this step"
          />
        </div>
      </div>

      <!-- Hint -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Hint (optional)</label>
        <input
          type="text"
          bind:value={step.checkpoint.hint}
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          placeholder="Help text for the checkpoint"
        />
      </div>

      <!-- Remove -->
      <div class="flex justify-end">
        <button
          class="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
          on:click={() => dispatch('remove')}
        >
          Remove Step
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>