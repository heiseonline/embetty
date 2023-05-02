import { Router } from 'express'
import { embetty } from '../../embetty'
import { BadRequestException } from '../../exceptions'

const router: Router = Router()

router.param('id', async (_req, res, next, id) => {
  try {
    id = id.replace('-poster-image', '')

    if (!/^[\w-]+$/.test(id)) {
      throw new BadRequestException()
    }

    res.locals.video = await embetty.loadYoutubeVideo(id)
    next()
  } catch (e) {
    next(e)
  }
})

router.get('/:id-poster-image', async (_req, res, next) => {
  try {
    const { data, type } = await res.locals.video.getPosterImage()
    if (!data) return next()
    res.type(type)
    res.send(data)
  } catch (e) {
    next(e)
  }
})

router.get('/:id.amp', (req, res) => {
  const attributes = { ...req.query }
  res.render('video.html', { video: res.locals.video, attributes })
})

router.get('/:id', (_req, res) => {
  res.send(res.locals.video)
})

export default router
