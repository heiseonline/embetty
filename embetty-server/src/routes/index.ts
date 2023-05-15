import cors from 'cors'
import debug_ from 'debug'
import { Router } from 'express'
import fs from 'fs'
import { ForbiddenException } from '../exceptions'
import { mastodonRouter } from './mastodon'
import { tweetRouter } from './tweet'
import { videoRouter } from './video'

const debug = debug_('embetty-server:index')

const router: Router = Router()

function getValidOrigins() {
  const _validOrigins = process.env.VALID_ORIGINS || ''
  return _validOrigins.length > 0 ? _validOrigins.split(',') : []
}

router.use(
  cors({
    origin: (origin, cb) => {
      const validOrigins = getValidOrigins()
      if (validOrigins[0] === '*' || !origin || validOrigins.includes(origin)) {
        cb(null, true)
        return
      }

      debug('Invalid origin:', origin, 'Valid:', validOrigins)
      cb(new ForbiddenException())
    },
  }),
)

router.use('/embetty.js', (_req, res, _next) => {
  const embettyPath = require.resolve('@embetty/component')
  res.type('application/javascript')
  fs.createReadStream(embettyPath, { encoding: 'utf8' }).pipe(res)
})

router.use('/tweet', tweetRouter)
router.use('/video', videoRouter)
router.use('/mastodon', mastodonRouter)

router.get('/version', (_req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-var-requires
  res.send({ version: require('../../package.json').version })
})

export default router
