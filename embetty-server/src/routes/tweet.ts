import { TwitterApiException } from '@embetty/base'
import { Router } from 'express'
import { embetty } from '../embetty'
import { BadRequestException, NotFoundException } from '../exceptions'

const router: Router = Router()

router.param('id', async (_req, res, next, id) => {
  try {
    if (!/^\d+$/.test(id)) {
      throw new BadRequestException()
    }

    res.locals.tweet = await embetty.loadTweet(id)
    next()
  } catch (error) {
    if (error instanceof TwitterApiException && error.notFound) {
      return next()
    }

    next(error)
  }
})

router.param('number', async (_req, _res, next, number) => {
  if (!/^\d+$/.test(number)) {
    return next(new BadRequestException())
  }

  next()
})

router.get('/:id/profile-image', async (_req, res, next) => {
  try {
    const image = await res.locals.tweet.getProfileImage()
    if (!image) {
      return next()
    }

    res.type(image.type)
    res.send(image.data)
  } catch (e) {
    next(e)
  }
})

router.get('/:id/link-image', async (_req, res, next) => {
  try {
    const image = await res.locals.tweet.getLinkImage()
    if (!image) {
      return next()
    }

    res.type(image.type)
    res.send(image.data)
  } catch (e) {
    next(e)
  }
})

router.get('/:id/images/:number', async (req, res, next) => {
  try {
    const image = await res.locals.tweet.getImage(req.params.number)
    if (!image) {
      return next()
    }

    res.type(image.type)
    res.send(image.data)
  } catch (e) {
    next(e)
  }
})

router.get('/:id.amp', (_req, res) => {
  if (!res.locals.tweet) {
    throw new NotFoundException()
  }

  res.render('tweet.html', { tweet: res.locals.tweet })
})

router.get('/:id', (_req, res, next) => {
  if (!res.locals.tweet) {
    return next()
  }

  res.send(res.locals.tweet)
})

export default router
