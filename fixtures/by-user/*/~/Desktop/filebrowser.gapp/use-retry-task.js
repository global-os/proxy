import { useCallback, useRef } from 'preact/hooks'

const DEFAULT_ATTEMPTS = 5

function delayMs(attempt) {
  return 200 * (attempt + 1)
}

/** Run an async task with bounded retries; bump cancel() to drop in-flight work. */
export function useRetryTask({ attempts = DEFAULT_ATTEMPTS } = {}) {
  const generation = useRef(0)

  const cancel = useCallback(() => {
    generation.current += 1
  }, [])

  const run = useCallback(async ({
    task,
    onAttempt,
    onSuccess,
    onFailure,
    onFinally,
  }) => {
    const gen = ++generation.current
    const isCurrent = () => gen === generation.current

    try {
      for (let attempt = 0; attempt < attempts; attempt += 1) {
        if (!isCurrent()) return
        onAttempt?.(attempt)

        try {
          const result = await task(attempt)
          if (!isCurrent()) return
          await onSuccess?.(result, attempt)
          return
        } catch (err) {
          if (!isCurrent()) return
          if (attempt < attempts - 1) {
            await new Promise((resolve) => window.setTimeout(resolve, delayMs(attempt)))
            continue
          }
          onFailure?.(err, attempt)
        }
      }
    } finally {
      if (isCurrent()) onFinally?.()
    }
  }, [attempts])

  return { run, cancel }
}