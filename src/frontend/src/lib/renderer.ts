import { createRenderer as felaCreateRenderer } from 'fela'
import embedded from 'fela-plugin-embedded'
import prefixer from 'fela-plugin-prefixer'
import fallbackValue from 'fela-plugin-fallback-value'
import unit from 'fela-plugin-unit'
import perf from 'fela-perf'
import beautifier from 'fela-beautifier'
import sortMediaQueryMobileFirst from 'fela-sort-media-query-mobile-first'
import { Animations } from '../types/animations'

const createRenderer = () => {
  const renderer = felaCreateRenderer({
    plugins: [embedded(), unit(), prefixer(), fallbackValue()],
    enhancers: [perf(), beautifier(), sortMediaQueryMobileFirst()],
  })

  const fadingBoxes = (props: {}) => ({
    '0%': {
      top: 0,
      left: 0,
      opacity: 0,
    },
    '50%': {
      opacity: 1
    },
    '100%': {
      left: `calc(var(--scale))`,
      top: `calc(var(--scale) * 3/4)`,
      opacity: 0
    }
  })

  const animations: Animations = {
    fadingBoxes: renderer.renderKeyframe(fadingBoxes, { })
  }

  renderer.renderStatic(
    {
      width: '100%',
      height: '100%',
      margin: 0,
      padding: 0,
      fontFamily: 'Lato',
    },
    'html,body,#app'
  )

  return {
    renderer,
    animations,
  }
}

export default createRenderer