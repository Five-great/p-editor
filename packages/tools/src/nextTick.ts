import { handleError, isIOS, noop } from "./base"

type CallbackFunction = () => void

const callbacks: CallbackFunction[] = []
let pending = false

function flushCallbacks(): void {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}

let timerFunc: () => void

if (typeof Promise !== 'undefined') {
  const p = Promise.resolve()
  const logError = (err: Error) => { console.error(err) }
  timerFunc = () => {
    p.then(flushCallbacks).catch(logError)
    if (isIOS) setTimeout(noop)
  }
} 
/*else if (!isIE && typeof MutationObserver !== 'undefined') {
  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true
  })
  timerFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
} */else {
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}

export function nextTick(cb?: CallbackFunction, ctx?: Record<string, unknown>): void | Promise<void> {
  let _resolve: () => void
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve()
    }
  })
  if (!pending) {
    pending = true
    timerFunc()
  }
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise<void>((resolve) => {
      _resolve = resolve
    })
  }
}