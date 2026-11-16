import { Router } from 'express'
import fs from 'fs'
import { cors } from './cors'
import { mastodonRouter } from './mastodon'
import { tweetRouter } from './tweet'
import { videoRouter } from './video'

const router: Router = Router()

router.use(cors)

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
