import { createComponent } from 'react-fela'
import { WorkspaceProps } from './types'
import { useWorkspace } from './useWorkspace'
import { WorkspaceWindow } from './WorkspaceWindow'

export type { WorkspaceActions } from './types'

const Frame = createComponent(
  () => ({
    position: 'relative',
    background: '#e5a455ff',
    width: '100%',
    height: '100%',
  }),
  'div',
  ['onMouseMove', 'onMouseUp']
)

const computeX = (x: number, width: number) =>
  (window as any).innerWidth / 2 - width / 2 + x

const computeY = (y: number, height: number) =>
  (window as any).innerHeight / 2 - height / 2 + y

export function Workspace({ children }: WorkspaceProps) {
  const { state, onMouseDown, onMouseUp, onMouseMove } = useWorkspace(
    children.onStartup
  )

  return (
    <Frame onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
      {state.windows.map((win, i) => (
        <WorkspaceWindow
          key={win.id}
          win={win}
          windowIndex={i}
          isDragging={!!state.dragOrigin}
          left={computeX(win.x, win.width) + 'px'}
          top={computeY(win.y, win.height) + 'px'}
          onTitleMouseDown={onMouseDown}
        />
      ))}
    </Frame>
  )
}
