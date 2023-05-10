import { MastodonStatus } from '@embetty/base'
import { Router } from 'express'
import { embetty } from '../embetty'
import { BadRequestException } from '../exceptions'

const router: Router = Router()

router.param('statusUrl', async (_req, res, next, statusUrl: string) => {
  try {
    if (!/^https?:\/\/([^/]+)\/@[^/]+\/(\d+)$/.test(statusUrl)) {
      throw new BadRequestException()
    }

    res.locals.mastodon = await embetty.loadMastodonStatus(statusUrl)
    next()
  } catch (error) {
    next(error)
  }
})

router.param('number', (_req, _res, next, number: string) => {
  if (!/^\d+$/.test(number)) {
    next(new BadRequestException())
    return
  }

  next()
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/:statusUrl(*)/profile-image', async (_req, res, next) => {
  try {
    const image = await (
      res.locals.mastodon as MastodonStatus
    ).getProfileImage()

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

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/:statusUrl(*)/link-image', async (_req, res, next) => {
  try {
    const image = await (res.locals.mastodon as MastodonStatus).getLinkImage()

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

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/:statusUrl(*)/images/:number', async (req, res, next) => {
  try {
    const image = await (res.locals.mastodon as MastodonStatus).getImage(
      parseInt(req.params.number!),
    )

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

// router.get('/:id.amp', (_req, res) => {
//   if (!res.locals.tweet) {
//     throw new NotFoundException()
//   }

//   res.render('tweet.html', { tweet: res.locals.tweet as Tweet })
// })

router.get('/:statusUrl(*)', (_req, res, next) => {
  console.log(_req.params)
  if (!res.locals.mastodon) {
    next()
    return
  }
  console.log('send local')
  res.send(res.locals.mastodon)
})

export default router
