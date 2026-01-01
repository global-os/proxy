import { createComponent } from 'react-fela'

const section = () => ({
  width: '100%',
  height: '100%',
  display: 'block',
})

const Frame = createComponent(section)

export const Page = ({ children }: React.PropsWithChildren) => {
  return <Frame>{children}</Frame>
}
