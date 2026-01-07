import { createComponent } from "react-fela";

export const LogoSection = createComponent(() => ({
  padding: '1em',
  display: 'block',
  color: '#333',
  ':hover': {
  color: '#333',
  }
}), 'a', [ 'href' ])
