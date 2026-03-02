import type { Course } from '../types/course'

export function generateHtml(course: Course): string {
  const { meta, steps, resources } = course
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(meta.title)}</title>
  <meta name="description" content="${escapeHtml(meta.description)}">
  <meta name="author" content="${escapeHtml(meta.author)}">
  
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .video-container { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; }
    .video-container iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
    .step-card { transition: all 0.3s ease; }
    .step-card:hover { transform: translateY(-2px); box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
    .step-card.completed { border-color: #10b981; background: #f0fdf4; }
    .checkpoint-btn { transition: all 0.2s ease; }
    .checkpoint-btn:hover { transform: scale(1.05); }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <div id="app" class="max-w-4xl mx-auto px-4 py-8">
    <!-- Header -->
    <header class="mb-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-2">${escapeHtml(meta.title)}</h1>
      <p class="text-gray-600 text-lg mb-4">${escapeHtml(meta.description)}</p>
      <div class="flex gap-4 text-sm text-gray-500">
        <span>👤 ${escapeHtml(meta.author)}</span>
        <span>⏱️ ${escapeHtml(meta.estimatedTime)}</span>
        <span>📊 ${escapeHtml(meta.difficulty)}</span>
      </div>
      <div class="mt-4 bg-blue-50 rounded-lg p-4">
        <div class="flex justify-between text-sm text-blue-700">
          <span id="progress-text">0 of ${steps.length} steps completed</span>
          <span id="progress-percent">0%</span>
        </div>
        <div class="w-full bg-blue-200 rounded-full h-2 mt-2">
          <div id="progress-bar" class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
        </div>
      </div>
    </header>

    <!-- Steps -->
    <main class="space-y-6">
      ${steps.map((step, index) => renderStep(step, index)).join('\n')}
    </main>

    <!-- Resources -->
    ${resources.length > 0 ? `
    <aside class="mt-12 bg-white rounded-xl shadow-sm p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">📚 Resources</h2>
      <ul class="space-y-2">
        ${resources.map(r => `
          <li>
            <a href="${escapeHtml(r.url)}" target="_blank" rel="noopener" class="text-blue-600 hover:text-blue-800 flex items-center gap-2">
              <span>🔗</span>
              <span>${escapeHtml(r.label)}</span>
            </a>
          </li>
        `).join('\n')}
      </ul>
    </aside>
    ` : ''}
  </div>

  <script>
    // Progress tracking
    const completedSteps = new Set(JSON.parse(localStorage.getItem('${course.id}-completed') || '[]'));
    
    function updateProgress() {
      const total = ${steps.length};
      const completed = completedSteps.size;
      const percent = Math.round((completed / total) * 100);
      
      document.getElementById('progress-text').textContent = completed + ' of ' + total + ' steps completed';
      document.getElementById('progress-percent').textContent = percent + '%';
      document.getElementById('progress-bar').style.width = percent + '%';
      
      // Update step cards
      ${steps.map((step, i) => `
        if (completedSteps.has('${step.id}')) {
          document.getElementById('step-${i}')?.classList.add('completed');
          document.getElementById('btn-${step.id}')?.classList.add('bg-green-500');
          document.getElementById('btn-${step.id}')?.classList.remove('bg-blue-500');
        }
      `).join('\n')}
    }
    
    function toggleStep(stepId) {
      if (completedSteps.has(stepId)) {
        completedSteps.delete(stepId);
      } else {
        completedSteps.add(stepId);
      }
      localStorage.setItem('${course.id}-completed', JSON.stringify([...completedSteps]));
      updateProgress();
    }
    
    // YouTube timestamp handling
    function seekTo(videoId, seconds) {
      const iframe = document.getElementById('yt-' + videoId);
      if (iframe) {
        iframe.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: 'seekTo',
          args: [seconds, true]
        }), '*');
      }
    }
    
    function parseTimestamp(ts) {
      const parts = ts.split(':').map(Number);
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      return parseInt(ts);
    }
    
    // Initialize
    updateProgress();
    
    // Restore scroll position
    const savedStep = localStorage.getItem('${course.id}-current-step');
    if (savedStep) {
      document.getElementById(savedStep)?.scrollIntoView({ behavior: 'smooth' });
    }
  </script>
</body>
</html>`
}

function renderStep(step: { id: string; title: string; videoUrl: string; videoTimestamp: string; videoEndTimestamp?: string; content: string; estimatedTime: string; checkpoint: { label: string; hint?: string } }, index: number): string {
  const videoId = extractVideoId(step.videoUrl)
  const videoEmbed = videoId ? getVideoEmbed(videoId, step.videoTimestamp, step.videoEndTimestamp) : ''
  const startSeconds = parseTimestamp(step.videoTimestamp)
  
  return `
    <article id="step-${index}" class="step-card bg-white rounded-xl shadow-sm overflow-hidden" data-step-id="${step.id}">
      <!-- Video Section -->
      ${videoEmbed ? `
      <div class="video-container">
        ${videoEmbed}
      </div>
      ` : ''}
      
      <!-- Content Section -->
      <div class="p-6">
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-2xl font-semibold text-gray-900">
            <span class="text-gray-400 mr-2">${index + 1}.</span>
            ${escapeHtml(step.title)}
          </h2>
          <span class="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">${escapeHtml(step.estimatedTime)}</span>
        </div>
        
        <!-- Jump to timestamp -->
        ${step.videoTimestamp && videoId ? `
        <button onclick="seekTo('${videoId}', ${startSeconds})" class="mb-4 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
          <span>▶️</span>
          <span>Jump to ${step.videoTimestamp}</span>
        </button>
        ` : ''}
        
        <!-- Markdown content -->
        <div class="prose prose-gray max-w-none mb-6">
          ${markdownToHtml(step.content)}
        </div>
        
        <!-- Checkpoint -->
        <div class="border-t pt-4">
          <button id="btn-${step.id}" onclick="toggleStep('${step.id}')" class="checkpoint-btn w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 flex items-center justify-center gap-2">
            <span class="text-lg">✓</span>
            <span>${escapeHtml(step.checkpoint.label)}</span>
          </button>
          ${step.checkpoint.hint ? `
          <p class="text-sm text-gray-500 mt-2 text-center">
            💡 ${escapeHtml(step.checkpoint.hint)}
          </p>
          ` : ''}
        </div>
      </div>
    </article>`
}

function extractVideoId(url: string): string | null {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/)
  if (ytMatch) return ytMatch[1]
  
  // Loom
  const loomMatch = url.match(/loom\.com\/share\/([a-f0-9]+)/)
  if (loomMatch) return loomMatch[1]
  
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return vimeoMatch[1]
  
  return null
}

function getVideoEmbed(videoId: string, start?: string, end?: string): string {
  // Assume YouTube for now - can be extended
  const startSeconds = start ? parseTimestamp(start) : 0
  const params = new URLSearchParams({
    start: String(startSeconds),
    enablejsapi: '1',
    origin: window.location.origin
  })
  
  if (end) {
    params.set('end', String(parseTimestamp(end)))
  }
  
  return `<iframe id="yt-${videoId}" src="https://www.youtube.com/embed/${videoId}?${params}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
}

function parseTimestamp(ts: string): number {
  const parts = ts.split(':').map(Number)
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  return parseInt(ts)
}

function markdownToHtml(md: string): string {
  // Basic markdown conversion
  return md
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-gray-900 mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold text-gray-900 mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4">$2</li>')
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/^(?!<[hubl])/gm, '<p class="mb-2">')
    .replace(/<\/p><p>/gm, '</p><p>')
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Shim for window (used in template)
declare const window: { location: { origin: string } } | undefined
const windowShim = typeof window !== 'undefined' ? window : { location: { origin: '' } }
const localStorageShim = typeof localStorage !== 'undefined' ? localStorage : {
  getItem: () => '[]',
  setItem: () => {}
}

// Export for use
export { extractVideoId, parseTimestamp }