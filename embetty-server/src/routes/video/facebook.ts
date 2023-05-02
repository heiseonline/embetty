import { Router } from 'express'
import { embetty } from '../../embetty'
import { BadRequestException } from '../../exceptions'

const router: Router = Router()

router.param('id', async (_req, res, next, id) => {
  try {
    if (!/^\d+$/.test(id)) {
      throw new BadRequestException()
    }

    res.locals.video = await embetty.loadFacebookVideo(id)
    next()
  } catch (e) {
    next(e)
  }
})

router.get('/:id.amp', (_req, res) => {
  res.render('video.html', { video: res.locals.video })
})

router.get('/:id', (_req, res) => {
  res.send(res.locals.video)
})

export default router
