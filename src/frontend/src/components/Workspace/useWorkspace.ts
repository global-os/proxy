import { MouseEvent, useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { reducer } from './reducer'
import { ResizeHandle, State, WorkspaceActionKind, WorkspaceActions } from './types'

const initialState: State = {
  nextWindowID: 1,
  windows: [],
  dragOrigin: undefined,
  draggingWindow: undefined,
  resizeOrigin: undefined,
  resizingWindow: undefined,
  resizeHandle: undefined,
  zIndexCounter: 1,
}

export function useWorkspace(onStartup?: (actions: WorkspaceActions) => void) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const actions = useMemo<WorkspaceActions>(() => ({
    openWindow(windowSpec) {
      dispatch({ type: WorkspaceActionKind.OPEN_WINDOW, payload: windowSpec })
    },
    setWindows(windows) {
      dispatch({ type: WorkspaceActionKind.SET_WINDOWS, payload: windows })
    },
    focusWindow(windowId, zIndex) {
      dispatch({ type: WorkspaceActionKind.FOCUS_WINDOW, windowId, zIndex })
    },
    closeWindow(windowId) {
      dispatch({ type: WorkspaceActionKind.CLOSE_WINDOW, windowId })
    },
    closeProcessWindows(processId) {
      dispatch({ type: WorkspaceActionKind.CLOSE_PROCESS_WINDOWS, processId })
    },
  }), [])

  const hasRun = useRef(false)
  useEffect(() => {
    if (hasRun.current || !onStartup) return
    hasRun.current = true
    onStartup(actions)
  }, [onStartup])

  const onMouseDown = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement
    const windowEl = target.closest('[data-window-index]')
    if (!windowEl) return

    const index = Number.parseInt(
      windowEl.getAttribute('data-window-index') ?? '-1',
      10,
    )
    if (index < 0) return

    event.preventDefault()

    dispatch({ type: WorkspaceActionKind.RAISE_WINDOW, index })

    const resizeHandle = target.closest('[data-resize-handle]')?.getAttribute(
      'data-resize-handle',
    ) as ResizeHandle | null

    if (resizeHandle === 'bottom-left' || resizeHandle === 'bottom-right') {
      dispatch({
        type: WorkspaceActionKind.START_RESIZING_WINDOW,
        index,
        handle: resizeHandle,
        payload: [event.clientX, event.clientY],
      })
      return
    }

    if (target.closest('[data-title-bar]')) {
      dispatch({
        type: WorkspaceActionKind.START_DRAGGING_WINDOW,
        index,
        payload: [event.clientX, event.clientY],
      })
    }
  }, [])

  const onMouseUp = useCallback(() => {
    dispatch({ type: WorkspaceActionKind.STOP_DRAGGING_WINDOW })
    dispatch({ type: WorkspaceActionKind.STOP_RESIZING_WINDOW })
  }, [])

  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      if (event.eventPhase !== 3) return
      if (event.buttons && state.resizeOrigin) {
        dispatch({
          type: WorkspaceActionKind.RESIZE_WINDOW,
          payload: [event.clientX, event.clientY],
        })
      } else if (event.buttons && state.dragOrigin) {
        dispatch({
          type: WorkspaceActionKind.DRAG_WINDOW,
          payload: [event.clientX, event.clientY],
        })
      }
      event.stopPropagation()
      event.preventDefault()
    },
    [state.dragOrigin, state.resizeOrigin]
  )

  return { state, actions, onMouseDown, onMouseUp, onMouseMove }
}
