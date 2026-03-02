(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,84168,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"warnOnce",{enumerable:!0,get:function(){return s}});let s=e=>{}},60981,(e,t,r)=>{t.exports=e.r(92045)},98295,e=>{"use strict";var t=e.i(43919),r=e.i(8717);let s=`You are a course creator. Read the transcript from a video and create a structured course in JSON format.

Break the transcript into logical learning steps. Each step should:
- Have a clear title
- Include a timestamp from the video
- Have informative content in markdown format
- Optionally include a checkpoint for comprehension

Return ONLY valid JSON with no markdown code blocks. The JSON must have this structure:
{
  "meta": {
    "title": "Course title",
    "description": "Course description (2-3 sentences)",
    "author": "Author name (if mentioned in transcript)",
    "estimatedTime": "Estimated time to complete",
    "difficulty": "beginner" | "intermediate" | "advanced"
  },
  "steps": [
    {
      "id": "unique-step-id",
      "title": "Step title",
      "videoUrl": "Video URL if provided",
      "videoTimestamp": "Start time (format: M:SS or H:MM:SS)",
      "content": "Step content in markdown format",
      "estimatedTime": "Time for this step",
      "checkpoint": {
        "label": "Checkpoint question or confirmation",
        "hint": "Optional hint"
      }
    }
  ],
  "resources": [
    {
      "label": "Resource name",
      "url": "Resource URL"
    }
  ]
}`,i=`Video URL: {video_url}

Transcript:
{transcript}

Create the course JSON now. Remember: return ONLY valid JSON, no markdown code blocks.`,o=`You are a course HTML generator. Create a standalone, responsive HTML page for the given course JSON.

Requirements:
- Use Tailwind CSS classes (assume Tailwind is available)
- Include a video player that syncs with step timestamps
- IMPORTANT: YouTube/Vimeo/Loom/Descript URLs are NOT direct MP4 files. Do NOT use <video><source src="https://youtube...">.
- For YouTube/Vimeo/Loom/Descript, use <iframe> embed URLs.
- For YouTube, convert watch/share URLs into embed format: https://www.youtube.com/embed/{id}?start={seconds}
- Prefer YouTube embeds on https://www.youtube-nocookie.com/embed/{id} and include iframe attributes: allowfullscreen, referrerpolicy="strict-origin-when-cross-origin", and allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share".
- Always include a visible fallback link labeled "Watch on YouTube" pointing to https://www.youtube.com/watch?v={id}.
- Only use <video> tag for direct media files (mp4/webm/ogg)
- Create step-by-step navigation with checkboxes for completion
- Track progress (store in localStorage)
- Use clean, modern design with good typography
- Make it fully responsive (mobile-friendly)
- Include all resources as links at the bottom

Return ONLY the HTML code, no markdown code blocks or explanations.`,a=`Course JSON:
{course_json}

Create the HTML page now. Remember: return ONLY valid HTML, no markdown code blocks.`,n=`You are a course editor. The user wants to refine an existing course. You will receive the current course JSON and the user's request.

Apply the requested changes while maintaining:
- Valid JSON structure
- Consistent step IDs
- Proper markdown formatting in content
- Accurate timestamps if mentioned

Return ONLY the updated valid JSON, no markdown code blocks or explanations.`,c=`Current Course JSON:
{course_json}

User Request: {user_prompt}

Return the updated course JSON now. Remember: return ONLY valid JSON, no markdown code blocks.`;class l extends Error{statusCode;details;constructor(e,t,r){super(e),this.statusCode=t,this.details=r,this.name="LLMError"}}class u extends l{retryAfter;constructor(e,t){super("Rate limit exceeded",429,t),this.retryAfter=e,this.name="LLMRateLimitError"}}let d=new class{baseUrl;apiKey;model;maxRetries;timeout;constructor(e,t,r){this.baseUrl=e.replace(/\/$/,""),this.apiKey=t,this.model=r?.model||"gpt-4",this.maxRetries=r?.maxRetries??3??3,this.timeout=r?.timeout??12e4??12e4}async complete(e,t,s=0){try{let s=new AbortController,i=setTimeout(()=>s.abort(),this.timeout),o=(0,r.resolveOnHyperProxyBaseUrl)(this.baseUrl),a=(0,r.withOnHyperHeaders)({"Content-Type":"application/json"},o);this.apiKey&&!(0,r.isProxyBaseUrl)(o)&&(a.Authorization=`Bearer ${this.apiKey}`);let n=await fetch(`${o}/chat/completions`,{method:"POST",headers:a,body:JSON.stringify({model:this.model,messages:[{role:"system",content:e},{role:"user",content:t}],temperature:.7,max_tokens:4096}),signal:s.signal});if(clearTimeout(i),!n.ok){if(429===n.status){let e=n.headers.get("retry-after");throw new u(e?parseInt(e):void 0)}let e=await n.json().catch(()=>({}));throw new l(e.error?.message||`LLM API error: ${n.status}`,n.status,e)}let c=await n.json(),d=c.choices[0]?.message?.content;if(!d)throw new l("No content in LLM response");return d}catch(r){if(r instanceof u)throw r;if(s<this.maxRetries-1){let r=1e3*Math.pow(2,s);return await new Promise(e=>setTimeout(e,r)),this.complete(e,t,s+1)}if(r instanceof l)throw r;throw new l(r instanceof Error?r.message:"Unknown LLM error")}}stripCodeBlocks(e){return e.replace(/^```(?:json|html)?\s*\n?/i,"").replace(/\n?```\s*$/i,"").trim()}async generateJSON(e,t){var r;let{system:o,user:a}={system:s,user:(r=t||"",i.replace("{video_url}",r||"Not provided").replace("{transcript}",e))},n=await this.complete(o,a),c=this.stripCodeBlocks(n);try{return JSON.parse(c)}catch{throw new l("Invalid JSON response from LLM")}}async generateHTML(e){let{system:t,user:r}={system:o,user:a.replace("{course_json}",JSON.stringify(e,null,2))},s=await this.complete(t,r);return this.stripCodeBlocks(s)}async refineJSON(e,t){let{system:r,user:s}={system:n,user:c.replace("{course_json}",JSON.stringify(e,null,2)).replace("{user_prompt}",t)},i=await this.complete(r,s),o=this.stripCodeBlocks(i);try{return JSON.parse(o)}catch{throw new l("Invalid JSON response from LLM")}}}(t.default.env.NEXT_PUBLIC_LLM_API_URL||"/proxy/openrouter/v1",t.default.env.NEXT_PUBLIC_LLM_API_KEY||"",{model:t.default.env.NEXT_PUBLIC_LLM_MODEL,maxRetries:parseInt(t.default.env.NEXT_PUBLIC_LLM_MAX_RETRIES||"3"),timeout:parseInt(t.default.env.NEXT_PUBLIC_LLM_TIMEOUT||"120000")});e.s(["LLMError",()=>l,"llmClient",0,d],98295)},39056,e=>{"use strict";let t=["youtube.com","youtu.be","loom.com","vimeo.com","descript.com"];function r(e){let t=[];if(e.meta){var r;let s,i=(r=e.meta,s=[],r.title?.trim()?r.title.length>200&&s.push("title must be 200 characters or less"):s.push("title is required"),r.description?.trim()?r.description.length>2e3&&s.push("description must be 2000 characters or less"):s.push("description is required"),r.author&&r.author.length>100&&s.push("author must be 100 characters or less"),r.estimatedTime&&r.estimatedTime.length>50&&s.push("estimatedTime must be 50 characters or less"),r.difficulty&&(["beginner","intermediate","advanced"].includes(r.difficulty)||s.push("difficulty must be beginner, intermediate, or advanced")),r.prerequisites&&!Array.isArray(r.prerequisites)&&s.push("prerequisites must be an array"),{valid:0===s.length,errors:s});t.push(...i.errors.map(e=>`meta.${e}`))}else t.push("meta is required");if(e.steps)if(Array.isArray(e.steps))if(0===e.steps.length)t.push("steps must have at least one step");else{let r=new Set;e.steps.forEach((e,i)=>{var o;let a,n,c=(a=[],n=void 0!==i?`step ${i+1}: `:"",e.id?.trim()?/^[a-zA-Z0-9_-]+$/.test(e.id)||a.push(`${n}id must contain only letters, numbers, hyphens, and underscores`):a.push(`${n}id is required`),e.title?.trim()?e.title.length>200&&a.push(`${n}title must be 200 characters or less`):a.push(`${n}title is required`),e.content?.trim()||a.push(`${n}content is required`),s(e.videoUrl)||a.push(`${n}videoUrl must be a valid YouTube, Loom, Vimeo, or Descript URL`),!(o=e.videoTimestamp)||/^\d+$/.test(o)||/^\d{1,3}:[0-5]\d$/.test(o)||/^\d{1,2}:[0-5]\d:[0-5]\d$/.test(o)||a.push(`${n}videoTimestamp must be in format "M:SS", "H:MM:SS", or seconds`),e.checkpoint&&!e.checkpoint.label?.trim()&&a.push(`${n}checkpoint.label is required`),{valid:0===a.length,errors:a});t.push(...c.errors),e.id&&(r.has(e.id)&&t.push(`duplicate step id: ${e.id}`),r.add(e.id))})}else t.push("steps must be an array");else t.push("steps is required");return e.resources&&(Array.isArray(e.resources)?e.resources.forEach((e,r)=>{let s=function(e){let t=[];if(e.label?.trim()||t.push("resource label is required"),e.url?.trim())try{new URL(e.url)}catch{t.push("resource url must be a valid URL")}else t.push("resource url is required");return{valid:0===t.length,errors:t}}(e);t.push(...s.errors.map(e=>`resource ${r+1}: ${e}`))}):t.push("resources must be an array")),{valid:0===t.length,errors:t}}function s(e){if(!e)return!0;try{let r=new URL(e);return t.some(e=>r.hostname.includes(e))}catch{return!1}}e.s(["isValidVideoUrl",()=>s,"validateCourseDefinition",()=>r])},97016,e=>{"use strict";var t=e.i(98295),r=e.i(39056);class s{client;constructor(e){this.client=e?.llmClient||t.llmClient}async generateFromTranscript(e,s){try{let t=await this.client.generateJSON(e,s),i=(0,r.validateCourseDefinition)(t);if(!i.valid)throw Error(`Invalid course JSON: ${i.errors.join(", ")}`);return t}catch(e){if(e instanceof t.LLMError)throw e;throw Error(e instanceof Error?e.message:"Failed to generate course")}}async generateHTML(e){try{return await this.client.generateHTML(e)}catch(e){if(e instanceof t.LLMError)throw e;throw Error(e instanceof Error?e.message:"Failed to generate HTML")}}async refineCourse(e,s){try{let t=await this.client.refineJSON(e,s),i=(0,r.validateCourseDefinition)(t);if(!i.valid)throw Error(`Invalid course JSON: ${i.errors.join(", ")}`);return t}catch(e){if(e instanceof t.LLMError)throw e;throw Error(e instanceof Error?e.message:"Failed to refine course")}}}function i(e){return new s(e)}e.s(["createCourseGenerator",()=>i])}]);