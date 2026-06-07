import { MouseEvent } from 'react'
import { createComponent } from 'react-fela'
import { AppWindow } from './types'

const Chrome = createComponent(
  ({
    left,
    top,
    width,
    height,
    zIndex,
  }: {
    left: string
    top: string
    width: string
    height: string
    zIndex: number
  }) => ({
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid rgba(0,0,0, 0.5)',
    background: 'red',
    position: 'absolute',
    zIndex: zIndex,
    width,
    height,
    top,
    left,
  })
)

const TitleBar = createComponent(
  () => ({
    borderBottom: '1px solid rgba(0,0,0, 0.5)',
    background: 'rgba(255,255,255, 0.8)',
    userSelect: 'none',
    flex: '0 0',
  }),
  'div',
  ['data-window-index', 'onMouseDown']
)

const StyledIframe = createComponent(
  ({ dragging }: { dragging: boolean }) => ({
    border: '0',
    flex: '1 1',
    width: '100%',
    pointerEvents: dragging ? 'none' : 'auto',
  }),
  'iframe',
  ['src']
)

type Props = {
  win: AppWindow
  windowIndex: number
  isDragging: boolean
  left: string
  top: string
  onTitleMouseDown: (e: MouseEvent) => void
}

export function WorkspaceWindow({
  win,
  windowIndex,
  isDragging,
  left,
  top,
  onTitleMouseDown,
}: Props) {
  return (
    <Chrome
      left={left}
      top={top}
      width={win.width + 'px'}
      height={win.height + 'px'}
      zIndex={win.zIndex}
    >
      <TitleBar data-window-index={windowIndex} onMouseDown={onTitleMouseDown}>
        {win.title}
      </TitleBar>
      <StyledIframe
        dragging={isDragging}
        src="https://app.app.onetrueos.com/"
      />
    </Chrome>
  )
}
