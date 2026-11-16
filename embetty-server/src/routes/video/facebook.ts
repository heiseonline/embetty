import { FacebookVideo } from '@embetty/base'
import { Router } from 'express'
import { embetty } from '../../embetty'
import { BadRequestException } from '../../exceptions'
import { videoPage } from '../../views'

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
  res.type('html').send(videoPage(res.locals.video as FacebookVideo))
})

router.get('/:id', (_req, res) => {
  res.send(res.locals.video)
})

export const facebookRouter = router
