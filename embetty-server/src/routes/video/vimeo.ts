import { VimeoVideo } from '@embetty/base'
import { Router } from 'express'
import { embetty } from '../../embetty'
import { BadRequestException } from '../../exceptions'

const router: Router = Router()

router.param('id', async (_req, res, next, id: string) => {
  try {
    if (!/^\d+$/.test(id)) {
      throw new BadRequestException()
    }

    res.locals.video = await embetty.loadVimeoVideo(id)
    next()
  } catch (error) {
    next(error)
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/:id-poster-image', async (_req, res, next) => {
  try {
    const image = await (res.locals.video as VimeoVideo).getPosterImage()

    if (!image) {
      next()
      return
    }

    res.type(image.type)
    res.send(image.data)
  } catch (error) {
    next(error)
  }
})

router.get('/:id.amp', (req, res) => {
  const attributes = { ...req.query }
  res.render('video.html', {
    video: res.locals.video as VimeoVideo,
    attributes,
  })
})

router.get('/:id', (_req, res) => {
  res.send(res.locals.video)
})

export const vimeoRouter = router
