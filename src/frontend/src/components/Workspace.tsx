import {
  HTMLProps,
  MouseEvent,
  MouseEventHandler,
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from 'react'
import { createComponent } from 'react-fela'

const Frame = createComponent(() => ({
  position: 'relative',
  background: '#e5a455ff',
  width: '100%',
  height: '100%',
}))

const Chrome = createComponent(
  ({
    left,
    top,
    width,
    height,
  }: {
    left: string
    top: string
    width: string
    height: string
  }) => ({
    border: '1px solid rgba(0,0,0, 0.5)',
    position: 'absolute',
    width,
    height,
    top,
    left,
  })
)

const Title = createComponent(
  () => ({
    borderBottom: '1px solid rgba(0,0,0, 0.5)',
    background: 'rgba(255,255,255, 0.8)',
  }),
  'div',
  ['data-window-index', 'onMouseMove']
)

type State = {
  windows: Window[]
  nextWindowID: number
}

type WindowSpec = {
  title: string

  width: number
  height: number

  x: number
  y: number
}

type Window = {
  id: number

  title: string

  width: number
  height: number

  x: number
  y: number
}

enum WorkspaceActionKind {
  OPEN_WINDOW = 'OPEN_WINDOW',
  MOVE_WINDOW = 'MOVE_WINDOW',
}

type WorkspaceAction =
  | {
      type: WorkspaceActionKind.OPEN_WINDOW
      payload: WindowSpec
    }
  | {
      type: WorkspaceActionKind.MOVE_WINDOW
      index: number
      payload: [number, number]
    }

function reducer(state: State, action: WorkspaceAction): State {
  if (action.type === WorkspaceActionKind.OPEN_WINDOW) {
    return {
      ...state,
      nextWindowID: state.nextWindowID + 1,
      windows: [
        ...state.windows,
        { ...action.payload, id: state.nextWindowID },
      ],
    }
  }
  if (action.type === WorkspaceActionKind.MOVE_WINDOW) {
    const windows = [...state.windows]
    const win = windows[action.index]
    win.x += action.payload[0]
    win.y += action.payload[1]
    windows[action.index] = win
    return {
      ...state,
      windows,
    }
  }
  return state
}

type Props = {
  children: {
    onStartup: (actions: WorkspaceActions) => void
  }
}

export type WorkspaceActions = {
  openWindow: (window: WindowSpec) => void
}

export const Workspace = ({ children }: Props) => {
  const [workspaceState, workspaceDispatch]: [
    State,
    React.Dispatch<WorkspaceAction>,
  ] = useReducer(reducer, {
    nextWindowID: 1,
    windows: [],
  })

  const workspaceActions: WorkspaceActions = {
    openWindow(windowSpec: WindowSpec) {
      workspaceDispatch({
        type: WorkspaceActionKind.OPEN_WINDOW,
        payload: windowSpec,
      })
    },
  }

  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    children.onStartup(workspaceActions)
  }, [])

  const computeX = (x: number, width: number) => {
    return (window as any).innerWidth / 2 - width / 2 + x
  }
  const computeY = (y: number, height: number) => {
    return (window as any).innerHeight / 2 - height / 2 + y
  }

  const onMouseMove = useCallback((event: MouseEvent) => {
    if (event.eventPhase !== 3) {
      return
    }
    if (event.buttons) {
      const index = Number.parseInt((event.target as HTMLElement).getAttribute(
        'data-window-index'
      ) ?? '0', 10)
      workspaceDispatch({
        type: WorkspaceActionKind.MOVE_WINDOW,
        index,
        payload: [event.movementX, event.movementY],
      })
    }
    event.stopPropagation()
    event.preventDefault()
  }, [])

  return (
    <Frame>
      {workspaceState.windows.map((win, i) => {
        return (
          <Chrome
            key={win.id}
            left={computeX(win.x, win.width) + 'px'}
            top={computeY(win.y, win.height) + 'px'}
            width={win.width + 'px'}
            height={win.height + 'px'}
          >
            <Title data-window-index={i} onMouseMove={onMouseMove}>
              {win.title}
            </Title>
          </Chrome>
        )
      })}
    </Frame>
  )
}
