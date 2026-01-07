import { PropsWithChildren } from 'react'
import { createComponent } from 'react-fela'
import { FadingBoxes } from './FadingBoxes'
import { GlobalOsTitle } from './GlobalOsTitle'
import { LogoSection } from './LogoSection'

const color = 'rgb(200, 128, 0)'

const BoxContainer = createComponent(() => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  marginTop: '1em'
}))

const Box = createComponent(() => ({
  border: '3px double ' + color,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  fontSize: '1rem',
  background: '#ddd',
  backgroundClip: 'padding-box',
  color: '#333',
}))


const BottomSection = createComponent(() => ({
  padding: '1em',
}))

export const VerticalFrame = ({ children}: PropsWithChildren) => {
  return (
    <BoxContainer>
    <Box>
      <LogoSection href="/">
        <FadingBoxes />
        <GlobalOsTitle>
          GlobalOS
        </GlobalOsTitle>
      </LogoSection>
      <BottomSection>{children}</BottomSection>
    </Box>
    </BoxContainer>
  )
}
