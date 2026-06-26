const PREFIX = 'globalos:process-state'

export function stateKey(sessionId: string, processId: number): string {
  return `${PREFIX}:${sessionId}:${processId}`
}

/** undefined = no saved state, null = corrupt blob */
export function loadProcessState(
  sessionId: string,
  processId: number,
): Record<string, unknown> | null | undefined {
  const raw = localStorage.getItem(stateKey(sessionId, processId))
  if (!raw) return undefined
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
    return parsed as Record<string, unknown>
  } catch {
    return null
  }
}

export function saveProcessState(
  sessionId: string,
  processId: number,
  state: Record<string, unknown>,
): void {
  localStorage.setItem(stateKey(sessionId, processId), JSON.stringify(state))
}