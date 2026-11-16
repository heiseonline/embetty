import { GlobalRegistrator } from '@happy-dom/global-registrator'
import { plugin } from 'bun'
import { spyOn } from 'bun:test'
import { scss } from '../../scss-plugin'
import { respondWith } from './lib/fetch'

GlobalRegistrator.register({ url: 'http://localhost/' })
void plugin(scss)

// Embeds fetch their data from the Embetty server once visible; tests that
// care about the data mock it with mockServerResponse().
spyOn(window, 'fetch').mockImplementation(respondWith({}))
