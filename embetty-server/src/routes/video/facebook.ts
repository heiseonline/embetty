import { FacebookVideo } from '@embetty/base/src/facebook-video'
import { Router } from 'express'
import { embetty } from '../../embetty'
import { BadRequestException } from '../../exceptions'

const router: Router = Router()

router.param('id', async (_req, res, next, id: string) => {
  try {
    if (!/^\d+$/.test(id)) {
      throw new BadRequestException()
    }

    res.locals.video = await embetty.loadFacebookVideo(id)
    next()
  } catch (error) {
    next(error)
  }
})

router.get('/:id.amp', (_req, res) => {
  res.render('video.html', { video: res.locals.video as FacebookVideo })
})

router.get('/:id', (_req, res) => {
  res.send(res.locals.video)
})

export const facebookRouter = router
