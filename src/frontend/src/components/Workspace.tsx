import { useEffect, useReducer } from 'react'
import { createComponent } from 'react-fela'

const Frame = createComponent(() => ({
  background: '#e5a455ff',
  width: '100%',
  height: '100%',
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
  openWindow: (window: Window) => void
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
    openWindow(window: Window) {
      workspaceDispatch({
        type: WorkspaceActionKind.OPEN_WINDOW,
        payload: window,
      })
    },
  }

  useEffect(() => {
    children.onStartup(workspaceActions)
  }, [])

  return (
    <Frame>
      {workspaceState.windows.map((win) => {
        return <div key={win.id}>window hello</div>
      })}
    </Frame>
  )
}
