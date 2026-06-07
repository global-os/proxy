import { State, WorkspaceAction, WorkspaceActionKind } from './types'

export function replaceNth<T>(arr: T[], n: number, replacement: T): T[] {
  const copy = [...arr]
  copy[n] = replacement
  return copy
}

export function reducer(state: State, action: WorkspaceAction): State {
  console.log('event', action.type)
  switch (action.type) {
    case WorkspaceActionKind.OPEN_WINDOW: {
      return {
        ...state,
        nextWindowID: state.nextWindowID + 1,
        windows: [
          ...state.windows,
          {
            ...action.payload,
            id: state.nextWindowID,
            zIndex: state.zIndexCounter,
          },
        ],
        zIndexCounter: state.zIndexCounter + 1,
      }
    }
    case WorkspaceActionKind.DRAG_WINDOW: {
      if (state.dragOrigin === undefined) {
        throw new Error('cannot drag while drag origin is undefined')
      }
      if (state.draggingWindow === undefined) {
        throw new Error('cannot drag while dragging window is undefined')
      }
      const index = state.draggingWindow
      const windows = [...state.windows]
      const win = windows[index]
      windows[index] = {
        ...win,
        x: win.x + (action.payload[0] - state.dragOrigin[0]),
        y: win.y + (action.payload[1] - state.dragOrigin[1]),
      }
      return {
        ...state,
        windows,
        dragOrigin: action.payload,
      }
    }
    case WorkspaceActionKind.START_DRAGGING_WINDOW: {
      return {
        ...state,
        windows: replaceNth(state.windows, action.index, {
          ...state.windows[action.index],
          zIndex: state.zIndexCounter,
        }),
        zIndexCounter: state.zIndexCounter + 1,
        dragOrigin: action.payload,
        draggingWindow: action.index,
      }
    }
    case WorkspaceActionKind.STOP_DRAGGING_WINDOW: {
      return {
        ...state,
        dragOrigin: undefined,
        draggingWindow: undefined,
      }
    }
  }
}
