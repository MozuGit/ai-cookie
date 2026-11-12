import { onBeforeUnmount, onMounted } from 'vue'

const EDGE_TOLERANCE = 1
const LINE_HEIGHT_PX = 16

function normalizeWheelDelta(event) {
  if (event.deltaMode === 1) return event.deltaY * LINE_HEIGHT_PX
  if (event.deltaMode === 2) return event.deltaY * window.innerHeight
  return event.deltaY
}

function isVerticalScrollContainer(el) {
  const { overflowY } = getComputedStyle(el)
  return overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay'
}

function canScroll(el, delta) {
  if (delta > 0) {
    return el.scrollTop + el.clientHeight < el.scrollHeight - EDGE_TOLERANCE
  }
  return el.scrollTop > 0
}

function findScrollContainer(start) {
  let node = start
  while (node && node !== document.body && node !== document.documentElement) {
    if (node instanceof HTMLElement && isVerticalScrollContainer(node)) return node
    node = node.parentElement
  }
  return null
}

function scrollByDelta(el, delta) {
  el.scrollBy({ top: delta, behavior: 'instant' })
}

function handleWheel(event) {
  if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey) {
    return
  }

  const delta = normalizeWheelDelta(event)
  if (!delta || !(event.target instanceof Element)) return

  const container = findScrollContainer(event.target)
  if (!container || canScroll(container, delta)) return

  let next = container.parentElement
  while (next && next !== document.body && next !== document.documentElement) {
    if (isVerticalScrollContainer(next) && canScroll(next, delta)) {
      event.preventDefault()
      scrollByDelta(next, delta)
      return
    }
    next = next.parentElement
  }

  const root = document.scrollingElement
  if (!root || !canScroll(root, delta)) return

  event.preventDefault()
  scrollByDelta(root, delta)
}

export function useWheelScrollChain() {
  onMounted(() => {
    window.addEventListener('wheel', handleWheel, { passive: false })
  })
  onBeforeUnmount(() => {
    window.removeEventListener('wheel', handleWheel)
  })
}
