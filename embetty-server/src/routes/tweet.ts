import { Tweet, TwitterApiException } from '@embetty/base'
import { Router } from 'express'
import { embetty } from '../embetty'
import { BadRequestException, NotFoundException } from '../exceptions'

const router: Router = Router()

router.param('id', async (_req, res, next, id: string) => {
  try {
    if (!/^\d+$/.test(id)) {
      throw new BadRequestException()
    }

    res.locals.tweet = await embetty.loadTweet(id)
    next()
  } catch (error) {
    if (error instanceof TwitterApiException && error.notFound) {
      next()
      return
    }

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
router.get('/:id/profile-image', async (_req, res, next) => {
  try {
    const image = await (res.locals.tweet as Tweet).getProfileImage()

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
router.get('/:id/link-image', async (_req, res, next) => {
  try {
    const image = await (res.locals.tweet as Tweet).getLinkImage()

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
router.get('/:id/images/:number', async (req, res, next) => {
  try {
    const image = await (res.locals.tweet as Tweet).getImage(
      parseInt(req.params.number),
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

router.get('/:id.amp', (_req, res) => {
  if (!res.locals.tweet) {
    throw new NotFoundException()
  }

  res.render('tweet.html', { tweet: res.locals.tweet as Tweet })
})

router.get('/:id', (_req, res, next) => {
  if (!res.locals.tweet) {
    next()
    return
  }

  res.send(res.locals.tweet)
})

export const tweetRouter = router
