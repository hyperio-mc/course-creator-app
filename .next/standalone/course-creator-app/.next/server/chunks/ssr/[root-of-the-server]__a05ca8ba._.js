module.exports=[56704,(a,b,c)=>{b.exports=a.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(a,b,c)=>{b.exports=a.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},20635,(a,b,c)=>{b.exports=a.x("next/dist/server/app-render/action-async-storage.external.js",()=>require("next/dist/server/app-render/action-async-storage.external.js"))},32917,(a,b,c)=>{"use strict";b.exports=a.r(26561).vendored.contexts.AppRouterContext},56762,(a,b,c)=>{"use strict";b.exports=a.r(26561).vendored.contexts.HooksClientContext},8541,(a,b,c)=>{"use strict";b.exports=a.r(26561).vendored.contexts.ServerInsertedHtml},49906,(a,b,c)=>{"use strict";b.exports=a.r(26561).vendored["react-ssr"].ReactServerDOMTurbopackClient},89317,a=>{"use strict";function b(a){if(a.startsWith("/proxy/"))return!0;try{return new URL(a).pathname.startsWith("/proxy/")}catch{return!1}}let c=`You are a course creator. Read the transcript from a video and create a structured course in JSON format.

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
}`,d=`Video URL: {video_url}

Transcript:
{transcript}

Create the course JSON now. Remember: return ONLY valid JSON, no markdown code blocks.`,e=`You are a course HTML generator. Create a standalone, responsive HTML page for the given course JSON.

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

Return ONLY the HTML code, no markdown code blocks or explanations.`,f=`Course JSON:
{course_json}

Create the HTML page now. Remember: return ONLY valid HTML, no markdown code blocks.`,g=`You are a course editor. The user wants to refine an existing course. You will receive the current course JSON and the user's request.

Apply the requested changes while maintaining:
- Valid JSON structure
- Consistent step IDs
- Proper markdown formatting in content
- Accurate timestamps if mentioned

Return ONLY the updated valid JSON, no markdown code blocks or explanations.`,h=`Current Course JSON:
{course_json}

User Request: {user_prompt}

Return the updated course JSON now. Remember: return ONLY valid JSON, no markdown code blocks.`;class i extends Error{statusCode;details;constructor(a,b,c){super(a),this.statusCode=b,this.details=c,this.name="LLMError"}}class j extends i{retryAfter;constructor(a,b){super("Rate limit exceeded",429,b),this.retryAfter=a,this.name="LLMRateLimitError"}}let k=new class{baseUrl;apiKey;model;maxRetries;timeout;constructor(a,b,c){this.baseUrl=a.replace(/\/$/,""),this.apiKey=b,this.model=c?.model||"gpt-4",this.maxRetries=c?.maxRetries??3??3,this.timeout=c?.timeout??12e4??12e4}async complete(a,c,d=0){try{var e;let d=new AbortController,f=setTimeout(()=>d.abort(),this.timeout),g=((e=this.baseUrl).startsWith("/proxy/"),e),h=function(a,c){if(!b(c))return a;let d=process.env.NEXT_PUBLIC_ONHYPER_APP_SLUG;return d?{...a,"X-App-Slug":d}:a}({"Content-Type":"application/json"},g);this.apiKey&&!b(g)&&(h.Authorization=`Bearer ${this.apiKey}`);let k=await fetch(`${g}/chat/completions`,{method:"POST",headers:h,body:JSON.stringify({model:this.model,messages:[{role:"system",content:a},{role:"user",content:c}],temperature:.7,max_tokens:4096}),signal:d.signal});if(clearTimeout(f),!k.ok){if(429===k.status){let a=k.headers.get("retry-after");throw new j(a?parseInt(a):void 0)}let a=await k.json().catch(()=>({}));throw new i(a.error?.message||`LLM API error: ${k.status}`,k.status,a)}let l=await k.json(),m=l.choices[0]?.message?.content;if(!m)throw new i("No content in LLM response");return m}catch(b){if(b instanceof j)throw b;if(d<this.maxRetries-1){let b=1e3*Math.pow(2,d);return await new Promise(a=>setTimeout(a,b)),this.complete(a,c,d+1)}if(b instanceof i)throw b;throw new i(b instanceof Error?b.message:"Unknown LLM error")}}stripCodeBlocks(a){return a.replace(/^```(?:json|html)?\s*\n?/i,"").replace(/\n?```\s*$/i,"").trim()}async generateJSON(a,b){var e;let{system:f,user:g}={system:c,user:(e=b||"",d.replace("{video_url}",e||"Not provided").replace("{transcript}",a))},h=await this.complete(f,g),j=this.stripCodeBlocks(h);try{return JSON.parse(j)}catch{throw new i("Invalid JSON response from LLM")}}async generateHTML(a){let{system:b,user:c}={system:e,user:f.replace("{course_json}",JSON.stringify(a,null,2))},d=await this.complete(b,c);return this.stripCodeBlocks(d)}async refineJSON(a,b){let{system:c,user:d}={system:g,user:h.replace("{course_json}",JSON.stringify(a,null,2)).replace("{user_prompt}",b)},e=await this.complete(c,d),f=this.stripCodeBlocks(e);try{return JSON.parse(f)}catch{throw new i("Invalid JSON response from LLM")}}}(process.env.NEXT_PUBLIC_LLM_API_URL||"/proxy/openrouter/v1",process.env.NEXT_PUBLIC_LLM_API_KEY||"",{model:process.env.NEXT_PUBLIC_LLM_MODEL,maxRetries:parseInt(process.env.NEXT_PUBLIC_LLM_MAX_RETRIES||"3"),timeout:parseInt(process.env.NEXT_PUBLIC_LLM_TIMEOUT||"120000")});a.s(["LLMError",()=>i,"llmClient",0,k],89317)},79489,a=>{"use strict";let b=["youtube.com","youtu.be","loom.com","vimeo.com","descript.com"];function c(a){let b=[];if(a.meta){var c;let d,e=(c=a.meta,d=[],c.title?.trim()?c.title.length>200&&d.push("title must be 200 characters or less"):d.push("title is required"),c.description?.trim()?c.description.length>2e3&&d.push("description must be 2000 characters or less"):d.push("description is required"),c.author&&c.author.length>100&&d.push("author must be 100 characters or less"),c.estimatedTime&&c.estimatedTime.length>50&&d.push("estimatedTime must be 50 characters or less"),c.difficulty&&(["beginner","intermediate","advanced"].includes(c.difficulty)||d.push("difficulty must be beginner, intermediate, or advanced")),c.prerequisites&&!Array.isArray(c.prerequisites)&&d.push("prerequisites must be an array"),{valid:0===d.length,errors:d});b.push(...e.errors.map(a=>`meta.${a}`))}else b.push("meta is required");if(a.steps)if(Array.isArray(a.steps))if(0===a.steps.length)b.push("steps must have at least one step");else{let c=new Set;a.steps.forEach((a,e)=>{var f;let g,h,i=(g=[],h=void 0!==e?`step ${e+1}: `:"",a.id?.trim()?/^[a-zA-Z0-9_-]+$/.test(a.id)||g.push(`${h}id must contain only letters, numbers, hyphens, and underscores`):g.push(`${h}id is required`),a.title?.trim()?a.title.length>200&&g.push(`${h}title must be 200 characters or less`):g.push(`${h}title is required`),a.content?.trim()||g.push(`${h}content is required`),d(a.videoUrl)||g.push(`${h}videoUrl must be a valid YouTube, Loom, Vimeo, or Descript URL`),!(f=a.videoTimestamp)||/^\d+$/.test(f)||/^\d{1,3}:[0-5]\d$/.test(f)||/^\d{1,2}:[0-5]\d:[0-5]\d$/.test(f)||g.push(`${h}videoTimestamp must be in format "M:SS", "H:MM:SS", or seconds`),a.checkpoint&&!a.checkpoint.label?.trim()&&g.push(`${h}checkpoint.label is required`),{valid:0===g.length,errors:g});b.push(...i.errors),a.id&&(c.has(a.id)&&b.push(`duplicate step id: ${a.id}`),c.add(a.id))})}else b.push("steps must be an array");else b.push("steps is required");return a.resources&&(Array.isArray(a.resources)?a.resources.forEach((a,c)=>{let d=function(a){let b=[];if(a.label?.trim()||b.push("resource label is required"),a.url?.trim())try{new URL(a.url)}catch{b.push("resource url must be a valid URL")}else b.push("resource url is required");return{valid:0===b.length,errors:b}}(a);b.push(...d.errors.map(a=>`resource ${c+1}: ${a}`))}):b.push("resources must be an array")),{valid:0===b.length,errors:b}}function d(a){if(!a)return!0;try{let c=new URL(a);return b.some(a=>c.hostname.includes(a))}catch{return!1}}a.s(["isValidVideoUrl",()=>d,"validateCourseDefinition",()=>c])},48589,a=>{"use strict";var b=a.i(89317),c=a.i(79489);class d{client;constructor(a){this.client=a?.llmClient||b.llmClient}async generateFromTranscript(a,d){try{let b=await this.client.generateJSON(a,d),e=(0,c.validateCourseDefinition)(b);if(!e.valid)throw Error(`Invalid course JSON: ${e.errors.join(", ")}`);return b}catch(a){if(a instanceof b.LLMError)throw a;throw Error(a instanceof Error?a.message:"Failed to generate course")}}async generateHTML(a){try{return await this.client.generateHTML(a)}catch(a){if(a instanceof b.LLMError)throw a;throw Error(a instanceof Error?a.message:"Failed to generate HTML")}}async refineCourse(a,d){try{let b=await this.client.refineJSON(a,d),e=(0,c.validateCourseDefinition)(b);if(!e.valid)throw Error(`Invalid course JSON: ${e.errors.join(", ")}`);return b}catch(a){if(a instanceof b.LLMError)throw a;throw Error(a instanceof Error?a.message:"Failed to refine course")}}}function e(a){return new d(a)}a.s(["createCourseGenerator",()=>e])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__a05ca8ba._.js.map