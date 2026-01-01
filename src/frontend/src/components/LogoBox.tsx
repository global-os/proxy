import { PropsWithChildren } from 'react'
import { createComponent } from 'react-fela'
import { FadingBoxes } from './FadingBoxes'

const Box = createComponent(() => ({
  display: 'flex',
  margin: '0 auto',
  fontSize: '1rem',
  width: '30.5rem',
  height: '15.5rem',
  border: '1px solid #777',
}))

const Contents = createComponent(() => ({
  flexGrow: 1,
  flexShrink: 1,
}))

const LeftSection = createComponent(() => ({
  padding: '1em'
  
}))

const Title = createComponent(() => ({
  marginTop: '1em',
  fontFamily: 'sans-serif',
  fontStyle: 'italic',
  textAlign: 'center',
  fontSize: '1.3em',
  fontWeight: 'bold',
  letterSpacing: '2'
}))

export const LogoBox = ({ children }: PropsWithChildren) => {
  return (
    <Box>
      <LeftSection>
        <FadingBoxes />
        <Title>
          GlobalOS
        </Title>
      </LeftSection>
      <Contents>{children}</Contents>
    </Box>
  )
}
