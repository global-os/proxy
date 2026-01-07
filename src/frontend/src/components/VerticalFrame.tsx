import { PropsWithChildren } from 'react'
import { createComponent } from 'react-fela'
import { FadingBoxes } from './FadingBoxes'
import { GlobalOsTitle } from './GlobalOsTitle'

const color = 'rgb(200, 128, 0)'

const BoxContainer = createComponent(
  () => ({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  }),
  'div'
)

const Box = createComponent(({ width }: { width?: string }) => ({
  width,
  border: '3px double ' + color,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  fontSize: '1rem',
  marginTop: '1em',
  background: '#ddd',
  backgroundClip: 'padding-box',
  color: '#333',
}))

const TopSection = createComponent(() => ({
  padding: '1em',
}))

const BottomSection = createComponent(() => ({
  padding: '1em',
}))

type Props = {
  width?: string
}

export const VerticalFrame = ({
  children,
  width,
}: PropsWithChildren & Props) => {
  return (
    <BoxContainer>
      <Box width={width}>
        <TopSection>
          <FadingBoxes />
          <GlobalOsTitle>GlobalOS</GlobalOsTitle>
        </TopSection>
        <BottomSection>{children}</BottomSection>
      </Box>
    </BoxContainer>
  )
}
