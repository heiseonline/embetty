import { plugin } from 'bun'
import { scss } from '../../scss-plugin'

// Components import their stylesheets; the bundle compiles them the same way.
void plugin(scss)
