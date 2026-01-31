import { useEffect, useReducer, useRef } from 'react'
import { createComponent } from 'react-fela'

const Frame = createComponent(() => ({
  background: '#e5a455ff',
  width: '100%',
  height: '100%',
}))

const Chrome = createComponent(
  ({
    left,
    top,
    width,
    height
  }: {
    left: string
    top: string
    width: string
    height: string
  }) => ({
    border: '1px solid rgba(0,0,0, 0.5)',
    position: 'relative',
    width,
    height,
    top,
    left,
  })
)

const Title = createComponent(() => ({
  borderBottom: '1px solid rgba(0,0,0, 0.5)'
}))

type State = {
  windows: Window[]
  nextWindowID: number
}

type WindowSpec = {
  title: string

  width: Number
  height: Number

  x: Number
  y: Number
}

type Window = {
  id: number

  title: string

  width: Number
  height: Number

  x: Number
  y: Number
}

enum WorkspaceActionKind {
  OPEN_WINDOW = 'OPEN_WINDOW',
}

type WorkspaceAction = {
  type: WorkspaceActionKind.OPEN_WINDOW
  payload: WindowSpec
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

  return (
    <Frame>
      {workspaceState.windows.map((win) => {
        return (
          <Chrome
            key={win.id}
            left={win.x + 'px'}
            top={win.y + 'px'}
            width={win.width + 'px'}
            height={win.height + 'px'}
          >
            <Title>{win.title}</Title>
          </Chrome>
        )
      })}
    </Frame>
  )
}
