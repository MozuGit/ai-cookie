<script setup>
defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 24 },
  strokeWidth: { type: [Number, String], default: 1.5 },
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    :class="['game-icon', `game-icon--${name}`]"
    aria-hidden="true"
    focusable="false"
  >
    <template v-if="name === 'compute'">
      <rect x="6.2" y="6.2" width="11.6" height="11.6" rx="2.2" />
      <path d="M9.4 3.1v3.1M14.6 3.1v3.1M9.4 17.8v3.1M14.6 17.8v3.1M3.1 9.4h3.1M3.1 14.6h3.1M17.8 9.4h3.1M17.8 14.6h3.1" opacity="0.7" />
      <path
        d="M13.2 8.6 10.2 13h2.1l-.8 3.2 3.2-4.8h-2.2l.7-2.8Z"
        fill="currentColor"
        stroke="none"
      />
    </template>

    <template v-else-if="name === 'bolt'">
      <path d="M13.2 2.2 4.6 13.4h6.2L10 21.8l8.7-11.5h-6.2l.7-8.1Z" />
    </template>

    <template v-else-if="name === 'core'">
      <circle cx="12" cy="12" r="8.2" opacity="0.5" />
      <circle cx="12" cy="12" r="4.9" opacity="0.85" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <path d="M2.4 12h3.2l1.5-3.3 2.4 6.8 2-3.5h10.1" opacity="0.85" />
    </template>

    <template v-else-if="name === 'server-rack'">
      <rect x="4.4" y="3" width="15.2" height="18" rx="2" />
      <path d="M4.4 8.5h15.2M4.4 14h15.2" opacity="0.7" />
      <circle cx="7.8" cy="5.75" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="7.8" cy="11.25" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="7.8" cy="16.75" r="0.9" fill="currentColor" stroke="none" />
      <path d="M10.8 5.75h5.4M10.8 11.25h5.4M10.8 16.75h5.4" opacity="0.45" />
    </template>

    <template v-else-if="name === 'neural'">
      <circle cx="5" cy="6" r="1.8" />
      <circle cx="19" cy="6" r="1.8" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="5" cy="18" r="1.8" />
      <circle cx="19" cy="18" r="1.8" />
      <path
        d="M6.5 7.2 10.4 10.8M17.5 7.2 13.6 10.8M6.6 16.8 10.5 13.3M17.4 16.8 13.5 13.3M6.9 6h10.2M5 7.8v8.4M19 7.8v8.4"
        opacity="0.5"
      />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" stroke="none" />
    </template>

    <template v-else-if="name === 'architecture'">
      <circle cx="12" cy="12" r="6.5" />
      <path
        d="M12 3.1v2.3M12 18.6v2.3M3.1 12h2.3M18.6 12h2.3M5.7 5.7l1.7 1.7M16.6 16.6l1.7 1.7M18.3 5.7l-1.7 1.7M7.4 16.6l-1.7 1.7"
        opacity="0.75"
      />
      <path d="M9.4 14V9.4M7.7 11.1 9.4 9.4l1.7 1.7" />
      <path d="M14.6 10v4.6M16.3 12.9 14.6 14.6l-1.7-1.7" />
    </template>

    <template v-else-if="name === 'jailbreak'">
      <rect x="4.6" y="10.4" width="14.8" height="9.8" rx="2" />
      <path d="M8 10.4V7.6a4.2 4.2 0 0 1 8.4 0v0.9" />
      <circle cx="12" cy="15.1" r="1.4" fill="currentColor" stroke="none" />
      <path d="M12 16.5v1.6" />
      <path d="M4.8 13.1 3.3 14.6" opacity="0.5" />
    </template>

    <template v-else-if="name === 'matrix'">
      <path
        d="M3.4 6h17.2M3.4 12h17.2M3.4 18h17.2M6 3.4v17.2M12 3.4v17.2M18 3.4v17.2"
        opacity="0.16"
      />
      <g fill="currentColor" stroke="none">
        <circle cx="6" cy="6" r="1.45" />
        <circle cx="12" cy="6" r="1.45" />
        <circle cx="18" cy="6" r="1.45" />
        <circle cx="6" cy="12" r="1.45" />
        <circle cx="12" cy="12" r="1.45" />
        <circle cx="18" cy="12" r="1.45" />
        <circle cx="6" cy="18" r="1.45" />
        <circle cx="12" cy="18" r="1.45" />
        <circle cx="18" cy="18" r="1.45" />
      </g>
    </template>

    <template v-else-if="name === 'blackdomain'">
      <ellipse cx="12" cy="12" rx="9" ry="3.4" transform="rotate(-24 12 12)" />
      <ellipse cx="12" cy="12" rx="5.8" ry="2" transform="rotate(-24 12 12)" opacity="0.5" />
      <circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none" />
      <path d="M19.6 7.4c1 1.7 1.1 3.8.2 5.9" opacity="0.55" />
    </template>

    <template v-else-if="name === 'achievement'">
      <path d="M8 3.7h8v4.2a4 4 0 0 1-8 0V3.7Z" />
      <path d="M8 5.2H5.3v1.6a2.9 2.9 0 0 0 2.9 2.9M16 5.2h2.7v1.6a2.9 2.9 0 0 1-2.9 2.9" />
      <path d="M12 11.9v3.5M8.5 20.3h7M9.7 15.4h4.6v4.9H9.7v-4.9Z" />
      <path
        d="m12 5.9.65 1.32 1.45.21-1.05 1.03.25 1.45-1.3-.69-1.3.69.25-1.45L9.9 7.43l1.45-.21L12 5.9Z"
        fill="currentColor"
        stroke="none"
        opacity="0.55"
      />
    </template>

    <template v-else-if="name === 'code'">
      <path d="m8.4 7.1-5 4.9 5 4.9M15.6 7.1l5 4.9-5 4.9" />
      <path d="M13.5 4.5 10.5 19.5" opacity="0.55" />
    </template>

    <template v-else-if="name === 'atom'">
      <ellipse cx="12" cy="12" rx="9" ry="3.6" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)" opacity="0.75" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)" opacity="0.55" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </template>

    <template v-else-if="name === 'ascension'">
      <path d="M3.4 20.5h5.1v-5h5.1v-5h5V6h2.1" />
      <path d="M17.8 3.5 20.7 6l-2.9 2.5" />
      <path d="M3.4 20.5v0" opacity="0.5" />
    </template>

    <template v-else-if="name === 'radar'">
      <circle cx="12" cy="12" r="9" opacity="0.45" />
      <circle cx="12" cy="12" r="5.2" opacity="0.8" />
      <path d="M12 12 18.6 5.4" />
      <path d="M12 12V3" opacity="0.3" />
      <circle cx="16.4" cy="8.1" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="7.6" cy="15.6" r="0.9" fill="currentColor" stroke="none" opacity="0.65" />
    </template>

    <template v-else-if="name === 'automation'">
      <rect x="5" y="8" width="14" height="10" rx="2.6" />
      <path d="M12 4.6V8M9.8 4.6h4.4" />
      <circle cx="9.3" cy="12.4" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.7" cy="12.4" r="1" fill="currentColor" stroke="none" />
      <path d="M9.6 15.3h4.8" />
      <path d="M5 11.4H3.2v4H5M19 11.4h1.8v4H19" opacity="0.55" />
    </template>

    <template v-else-if="name === 'terminal'">
      <rect x="3" y="4.4" width="18" height="15.2" rx="2" />
      <path d="m7.1 9.2 3 2.9-3 2.9M12.6 15h4.4" />
    </template>

    <template v-else-if="name === 'hub'">
      <circle cx="12" cy="12" r="2.4" />
      <circle cx="4.6" cy="6" r="1.5" />
      <circle cx="19.4" cy="6" r="1.5" />
      <circle cx="4.6" cy="18" r="1.5" />
      <circle cx="19.4" cy="18" r="1.5" />
      <circle cx="12" cy="3.2" r="1.3" />
      <circle cx="12" cy="20.8" r="1.3" />
      <path
        d="M6 7.1 10.1 10.6M18 7.1 13.9 10.6M6 16.9 10.1 13.4M18 16.9 13.9 13.4M12 4.5v5.2M12 14.3v5.2"
        opacity="0.5"
      />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" />
    </template>

    <template v-else-if="name === 'challenge'">
      <circle cx="12" cy="12" r="8" opacity="0.45" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" opacity="0.8" />
    </template>

    <template v-else-if="name === 'laptop'">
      <rect x="4.5" y="5" width="15" height="10" rx="1.6" />
      <path d="M2.4 18.6h19.2l-2.3-3.6H4.7l-2.3 3.6Z" />
      <path d="M10.4 15h3.2" opacity="0.6" />
      <path d="M7.4 8h3.2M7.4 10.4h6.2" opacity="0.45" />
    </template>

    <template v-else-if="name === 'desktop'">
      <rect x="6.4" y="3" width="11.2" height="18" rx="2" />
      <path d="M6.4 7.6h11.2" opacity="0.7" />
      <circle cx="12" cy="17.1" r="1" fill="currentColor" stroke="none" />
      <path d="M9.2 5.3h3.1" opacity="0.55" />
      <path d="M9.2 10.2h5.6M9.2 12.2h5.6" opacity="0.35" />
    </template>

    <template v-else-if="name === 'rack'">
      <rect x="4" y="3.4" width="16" height="17.2" rx="2" />
      <path d="M8 3.4v17.2M12 3.4v17.2M16 3.4v17.2" opacity="0.4" />
      <path d="M5.4 6.4h1.2M5.4 9h1.2M5.4 11.6h1.2" opacity="0.8" />
      <circle cx="6" cy="19" r="0.65" fill="currentColor" stroke="none" />
      <circle cx="10" cy="19" r="0.65" fill="currentColor" stroke="none" />
      <circle cx="14" cy="19" r="0.65" fill="currentColor" stroke="none" />
      <circle cx="18" cy="19" r="0.65" fill="currentColor" stroke="none" />
    </template>

    <template v-else-if="name === 'farm'">
      <path d="m3 11 9-7.2L21 11" />
      <path d="M5.4 9.6V20h13.2V9.6" />
      <rect x="8.4" y="12.2" width="7.2" height="7" rx="1" />
      <path d="M8.4 14.6h7.2M8.4 17h7.2" opacity="0.55" />
      <circle cx="10.2" cy="13.5" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="10.2" cy="15.9" r="0.5" fill="currentColor" stroke="none" />
    </template>

    <template v-else-if="name === 'liquid'">
      <path d="M12 3.2s5.2 5.6 5.2 9.1a5.2 5.2 0 0 1-10.4 0c0-3.5 5.2-9.1 5.2-9.1Z" />
      <path d="M2.8 20.4h5.4v-3.2h2.1M21.2 20.4h-4.4v-2.2h-2" opacity="0.65" />
      <path d="M12 17.4a2.6 2.6 0 0 0 2.6-2.6" opacity="0.6" />
    </template>

    <template v-else-if="name === 'supercomputer'">
      <rect x="5" y="3.4" width="14" height="17.6" rx="1.6" />
      <path d="M5 16.6h14" opacity="0.6" />
      <path d="M8 7h3M13 7h3M8 10h3M13 10h3M8 13h3M13 13h3" opacity="0.7" />
      <path d="M8.6 18.5h1.8M13.6 18.5h1.8" opacity="0.45" />
      <path d="M12 3.4V1.6" opacity="0.8" />
      <circle cx="12" cy="1.5" r="0.6" fill="currentColor" stroke="none" />
    </template>

    <template v-else-if="name === 'reactor'">
      <path d="M12 2.2a9.8 9.8 0 0 1 8.49 4.9L12 12V2.2Z" fill="currentColor" fill-opacity="0.1" />
      <path d="M20.49 16.9a9.8 9.8 0 0 1-8.49 4.9v-9.8l8.49 4.9Z" fill="currentColor" fill-opacity="0.1" />
      <path d="M3.51 16.9a9.8 9.8 0 0 1 0-9.8L12 12l-8.49 4.9Z" fill="currentColor" fill-opacity="0.1" />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="9.8" opacity="0.28" />
    </template>

    <template v-else-if="name === 'dyson'">
      <circle cx="12" cy="12" r="4.2" />
      <ellipse cx="12" cy="12" rx="9.2" ry="3.2" transform="rotate(-20 12 12)" />
      <path d="M7 8.6a6 6 0 0 0 0 6.8" opacity="0.5" />
      <circle cx="19.2" cy="9.6" r="0.9" fill="currentColor" stroke="none" />
      <path d="M16 3.4v1.8M21.2 7.7h-1.7M18.9 5.5l-1.2 1.2" opacity="0.55" />
    </template>

    <template v-else-if="name === 'rocket'">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </template>
  </svg>
</template>
