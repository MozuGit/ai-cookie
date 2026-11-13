<script setup>
import { getAchievementToastDuration } from '../composables/achievementData'
import { formatTextNumbers } from '../composables/useGameState'

defineProps({
  toasts: { type: Array, default: () => [] },
})

const emit = defineEmits(['dismiss-all'])

const duration = getAchievementToastDuration()

const sparks = Array.from({ length: 16 }, (_, index) => ({
  left: `${(index * 37 + 11) % 100}%`,
  delay: `${((index * 0.19) % 2.4).toFixed(2)}s`,
  size: `${2 + (index % 3)}px`,
}))

function tierMetaFor(toast) {
  return (
    toast.tierMeta ?? {
      id: toast.tier,
      roman: 'I',
      label: `Tier ${toast.tier}`,
      title: '未知协议',
      code: 'UNKNOWN',
      accent: '#e2e8f0',
    }
  )
}
</script>

<template>
  <Teleport to="body">
    <div
      class="achievement-toast-layer"
      aria-live="polite"
      aria-atomic="false"
    >
      <TransitionGroup
        name="achievement-toast"
        tag="div"
        class="achievement-toast-stack"
      >
        <aside
          v-for="toast in toasts"
          :key="toast.key"
          class="achievement-toast"
          :class="{ 'achievement-toast--secret': toast.secret }"
          :data-tier="toast.tier"
          :data-secret="toast.secret ? 'true' : 'false'"
          :data-achievement-id="toast.id"
          role="status"
        >
          <span class="achievement-toast__edge" aria-hidden="true"></span>

          <span
            v-if="toast.tier >= 4"
            class="achievement-toast__flash"
            :data-tier="toast.tier"
            aria-hidden="true"
          ></span>

          <div
            v-if="toast.tier >= 5"
            class="achievement-toast__particles"
            aria-hidden="true"
          >
            <span
              v-for="(spark, index) in sparks"
              :key="index"
              class="achievement-toast__spark"
              :style="{
                left: spark.left,
                animationDelay: spark.delay,
                width: spark.size,
                height: spark.size,
              }"
            ></span>
          </div>

          <span class="achievement-toast__badge" aria-hidden="true">
            {{ toast.glyph }}
          </span>

          <div class="achievement-toast__body">
            <p class="achievement-toast__eyebrow">
              {{
                toast.secret
                  ? 'HIDDEN_PROTOCOL // TIER VI'
                  : `${tierMetaFor(toast).code} // TIER ${tierMetaFor(toast).roman}`
              }}
            </p>
            <p class="achievement-toast__headline">
              🏆 {{ toast.secret ? '隐藏成就解锁' : '成就解锁' }} // {{ toast.name }} [ {{
                toast.secret ? '隐藏协议' : tierMetaFor(toast).label
              }} ]
            </p>
            <p class="achievement-toast__condition">{{ formatTextNumbers(toast.condition) }}</p>
            <p class="achievement-toast__code">
              {{ toast.code }} · {{ tierMetaFor(toast).title }}
            </p>
          </div>

          <span class="achievement-toast__roman" aria-hidden="true">
            {{ tierMetaFor(toast).roman }}
          </span>

          <button
            type="button"
            class="achievement-toast__close"
            title="关闭全部提示"
            aria-label="关闭全部成就提示"
            @click="emit('dismiss-all')"
          >
            <span aria-hidden="true">✕</span>
          </button>

          <span
            class="achievement-toast__bar"
            :style="{ animationDuration: `${duration}ms` }"
            aria-hidden="true"
          ></span>
        </aside>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
