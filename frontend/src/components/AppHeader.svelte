<script>
  let { onNewCourse } = $props()

  let mobileMenuOpen = $state(false)

  const navLinks = [
    { label: 'My Courses' },
    { label: 'Templates' },
    { label: 'Settings' }
  ]

  function handleNewCourse() {
    mobileMenuOpen = false
    onNewCourse?.()
  }
</script>

<header class="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
  <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
    <div class="flex items-center gap-3" aria-label="Course Creator home">
      <span class="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 text-sm font-bold text-white shadow">
        CC
      </span>
      <span class="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">Course Creator</span>
    </div>

    <div class="hidden items-center gap-8 md:flex">
      <nav class="flex items-center gap-6" aria-label="Primary">
        {#each navLinks as link}
          <button type="button" class="text-sm font-medium text-slate-600 transition hover:text-slate-900">{link.label}</button>
        {/each}
      </nav>

      <button
        class="inline-flex items-center rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-600/20 transition hover:bg-orange-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
        onclick={handleNewCourse}
      >
        + New Course
      </button>
    </div>

    <button
      class="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 md:hidden"
      aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
      aria-expanded={mobileMenuOpen}
      onclick={() => {
        mobileMenuOpen = !mobileMenuOpen
      }}
    >
      {#if mobileMenuOpen}
        <span class="text-xl leading-none">&times;</span>
      {:else}
        <span class="text-xl leading-none">&#9776;</span>
      {/if}
    </button>
  </div>

  {#if mobileMenuOpen}
    <div class="border-t border-slate-200 bg-white px-4 py-4 shadow md:hidden sm:px-6">
      <nav class="flex flex-col gap-3" aria-label="Mobile primary">
        {#each navLinks as link}
          <button
            type="button"
            class="rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
          >
            {link.label}
          </button>
        {/each}
      </nav>

      <button
        class="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-600/20 transition hover:bg-orange-700"
        onclick={handleNewCourse}
      >
        + New Course
      </button>
    </div>
  {/if}
</header>
