<script setup>
import { onBeforeUnmount, watch } from 'vue'
import GameIcon from './GameIcon.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  side: { type: String, default: 'left' },
  title: { type: String, required: true },
  eyebrow: { type: String, default: '' },
  icon: { type: String, default: 'hub' },
  tone: { type: String, default: 'cyan' },
})

const emit = defineEmits(['close'])

let previousOverflow = ''

function close() {
  emit('close')
}

function onKeydown(event) {
  if (props.open && event.key === 'Escape') close()
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', onKeydown)
    } else {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeydown)
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  document.body.style.overflow = previousOverflow
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="holo-shell">
      <div
        v-if="open"
        class="holo-shell"
        :class="[`holo-shell--${side}`, `holo-shell--tone-${tone}`]"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <div class="holo-shell__backdrop" @click="close"></div>

        <section class="holo-shell__panel">
          <span class="holo-shell__corner holo-shell__corner--tl" aria-hidden="true"></span>
          <span class="holo-shell__corner holo-shell__corner--tr" aria-hidden="true"></span>
          <span class="holo-shell__corner holo-shell__corner--bl" aria-hidden="true"></span>
          <span class="holo-shell__corner holo-shell__corner--br" aria-hidden="true"></span>

          <header class="holo-shell__head">
            <span class="holo-shell__sigil" aria-hidden="true">
              <GameIcon :name="icon" :size="20" />
            </span>
            <div class="holo-shell__heading">
              <p v-if="eyebrow" class="holo-shell__eyebrow">{{ eyebrow }}</p>
              <h2 class="holo-shell__title">{{ title }}</h2>
            </div>
            <div class="holo-shell__extra">
              <slot name="header-extra" />
            </div>
            <button
              type="button"
              class="holo-shell__close"
              :aria-label="`关闭${title}`"
              @click="close"
            >
              ✕
            </button>
          </header>

          <div class="holo-shell__body">
            <slot />
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
