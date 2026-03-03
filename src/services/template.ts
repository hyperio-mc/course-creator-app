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
    .tab-btn { transition: all 0.2s ease; }
    .tab-btn.active { background: #3b82f6; color: white; }
    .tab-btn.completed { background: #10b981; color: white; }
    .tab-btn.completed.active { background: #059669; color: white; }
    .step-content { display: none; }
    .step-content.active { display: block; }
    .checkpoint-btn { transition: all 0.2s ease; }
    .checkpoint-btn:hover { transform: scale(1.02); }
    .checkpoint-btn.completed { background: #10b981 !important; }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <div id="app" class="max-w-4xl mx-auto px-4 py-8">
    <!-- Header -->
    <header class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">${escapeHtml(meta.title)}</h1>
      <p class="text-gray-600 mb-4">${escapeHtml(meta.description)}</p>
      <div class="flex gap-4 text-sm text-gray-500">
        <span>👤 ${escapeHtml(meta.author)}</span>
        <span>⏱️ ${escapeHtml(meta.estimatedTime)}</span>
        <span>📊 ${escapeHtml(meta.difficulty)}</span>
      </div>
      
      <!-- Progress Bar -->
      <div class="mt-4 bg-blue-50 rounded-lg p-3">
        <div class="flex justify-between text-sm text-blue-700 mb-1">
          <span id="progress-text">0 of ${steps.length} steps completed</span>
          <span id="progress-percent">0%</span>
        </div>
        <div class="w-full bg-blue-200 rounded-full h-2">
          <div id="progress-bar" class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
        </div>
      </div>
    </header>

    <!-- Tab Navigation -->
    <nav class="bg-white rounded-xl shadow-sm p-2 mb-6 overflow-x-auto">
      <div class="flex gap-2">
        ${steps.map((step, index) => `
          <button 
            id="tab-${index}" 
            onclick="showStep(${index})" 
            class="tab-btn flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            <span class="mr-1">${index + 1}.</span>
            <span class="hidden sm:inline">${escapeHtml(step.title.substring(0, 20))}${step.title.length > 20 ? '...' : ''}</span>
            <span class="sm:hidden">Step ${index + 1}</span>
          </button>
        `).join('\n')}
      </div>
    </nav>

    <!-- Steps Content (only one visible at a time) -->
    <main>
      ${steps.map((step, index) => renderStepTabbed(step, index)).join('\n')}
    </main>

    <!-- Navigation Buttons -->
    <div class="flex justify-between items-center mt-6 bg-white rounded-xl shadow-sm p-4">
      <button 
        id="prev-btn" 
        onclick="prevStep()" 
        class="px-6 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ← Previous
      </button>
      
      <span id="step-indicator" class="text-sm text-gray-500">Step 1 of ${steps.length}</span>
      
      <button 
        id="next-btn" 
        onclick="nextStep()" 
        class="px-6 py-2 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next →
      </button>
    </div>

    <!-- Resources -->
    ${resources.length > 0 ? `
    <aside class="mt-8 bg-white rounded-xl shadow-sm p-6">
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
    const totalSteps = ${steps.length};
    let currentStep = parseInt(localStorage.getItem('${course.id}-current-step') || '0');
    const completedSteps = new Set(JSON.parse(localStorage.getItem('${course.id}-completed') || '[]'));
    
    function showStep(index) {
      if (index < 0 || index >= totalSteps) return;
      currentStep = index;
      localStorage.setItem('${course.id}-current-step', String(currentStep));
      
      // Update tab styles
      for (let i = 0; i < totalSteps; i++) {
        const tab = document.getElementById('tab-' + i);
        const content = document.getElementById('step-' + i);
        
        tab.classList.remove('active');
        content.classList.remove('active');
        
        if (completedSteps.has('${steps[0].id}'.replace('step-1', 'step-' + (i + 1)))) {
          // Handle completion state
        }
      }
      
      document.getElementById('tab-' + index).classList.add('active');
      document.getElementById('step-' + index).classList.add('active');
      
      // Update navigation
      document.getElementById('prev-btn').disabled = index === 0;
      document.getElementById('next-btn').disabled = index === totalSteps - 1;
      document.getElementById('step-indicator').textContent = 'Step ' + (index + 1) + ' of ' + totalSteps;
      
      // Scroll to top of content
      document.getElementById('app').scrollIntoView({ behavior: 'smooth' });
    }
    
    function prevStep() {
      if (currentStep > 0) showStep(currentStep - 1);
    }
    
    function nextStep() {
      if (currentStep < totalSteps - 1) showStep(currentStep + 1);
    }
    
    function toggleStep(stepId, stepIndex) {
      if (completedSteps.has(stepId)) {
        completedSteps.delete(stepId);
      } else {
        completedSteps.add(stepId);
      }
      localStorage.setItem('${course.id}-completed', JSON.stringify([...completedSteps]));
      updateProgress();
      updateTabStates();
    }
    
    function updateProgress() {
      const completed = completedSteps.size;
      const percent = Math.round((completed / totalSteps) * 100);
      
      document.getElementById('progress-text').textContent = completed + ' of ' + totalSteps + ' steps completed';
      document.getElementById('progress-percent').textContent = percent + '%';
      document.getElementById('progress-bar').style.width = percent + '%';
      
      // Update checkpoint buttons
      ${steps.map((step, i) => `
        const btn${i} = document.getElementById('btn-${step.id}');
        if (btn${i}) {
          if (completedSteps.has('${step.id}')) {
            btn${i}.classList.add('completed');
            btn${i}.innerHTML = '<span class="text-lg">✓</span><span>Completed!</span>';
          } else {
            btn${i}.classList.remove('completed');
            btn${i}.innerHTML = '<span class="text-lg">✓</span><span>${escapeHtml(step.checkpoint.label)}</span>';
          }
        }
      `).join('\n')}
    }
    
    function updateTabStates() {
      ${steps.map((step, i) => `
        const tab${i} = document.getElementById('tab-${i}');
        if (tab${i}) {
          if (completedSteps.has('${step.id}')) {
            tab${i}.classList.add('completed');
          } else {
            tab${i}.classList.remove('completed');
          }
        }
      `).join('\n')}
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
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') prevStep();
      if (e.key === 'ArrowRight') nextStep();
    });
    
    // Initialize
    showStep(currentStep);
    updateProgress();
    updateTabStates();
  </script>
</body>
</html>`
}

function renderStepTabbed(step: { id: string; title: string; videoUrl: string; videoTimestamp: string; videoEndTimestamp?: string; content: string; estimatedTime: string; checkpoint: { label: string; hint?: string } }, index: number): string {
  const videoId = extractVideoId(step.videoUrl)
  const videoEmbed = videoId ? getVideoEmbed(videoId, step.videoTimestamp, step.videoEndTimestamp) : ''
  const startSeconds = parseTimestamp(step.videoTimestamp)
  
  return `
    <article id="step-${index}" class="step-content bg-white rounded-xl shadow-sm overflow-hidden" data-step-id="${step.id}">
      <!-- Step Header -->
      <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold text-white">
            Step ${index + 1}: ${escapeHtml(step.title)}
          </h2>
          <span class="text-sm text-blue-100 bg-blue-400/30 px-3 py-1 rounded-full">${escapeHtml(step.estimatedTime)}</span>
        </div>
      </div>
      
      <!-- Video Section -->
      ${videoEmbed ? `
      <div class="video-container bg-gray-900">
        ${videoEmbed}
      </div>
      ` : ''}
      
      <!-- Jump to timestamp -->
      ${step.videoTimestamp && videoId ? `
      <div class="px-6 pt-4">
        <button onclick="seekTo('${videoId}', ${startSeconds})" class="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
          <span>▶️</span>
          <span>Jump to ${step.videoTimestamp} in video</span>
        </button>
      </div>
      ` : ''}
      
      <!-- Content Section -->
      <div class="p-6">
        <!-- Markdown content -->
        <div class="prose prose-gray max-w-none mb-6">
          ${markdownToHtml(step.content)}
        </div>
        
        <!-- Checkpoint -->
        <div class="border-t pt-4 mt-6">
          <button 
            id="btn-${step.id}" 
            onclick="toggleStep('${step.id}', ${index})" 
            class="checkpoint-btn w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 flex items-center justify-center gap-2"
          >
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
    origin: '*' // Allow embeds from any origin (server-side safe)
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