import { plugin } from 'bun'
import { inlineCss } from '../../css-plugin'

// Components import their stylesheets; the bundle compiles them the same way.
void plugin(inlineCss)
