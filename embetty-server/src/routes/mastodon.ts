import { MastodonStatus } from '@embetty/base'
import { NextFunction, Request, Response, Router } from 'express'
import { embetty } from '../embetty'
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '../exceptions'

const router: Router = Router()

// Default nginx setup uses `merge_slashes` which causes the request URL to be
// `https:/{url}` instead of `https://{url}`. This middleware fixes that.
function fixNginxSlashMerge(req: Request, _res: Response, next: NextFunction) {
  req.url = req.url.replace(/^\/https?:\/([^/]+)\/(.*)$/, '/https://$1/$2')

  next()
}

router.use(fixNginxSlashMerge)

// Unset means every instance is allowed. Private addresses are rejected by
// @embetty/base regardless.
function getAllowedInstances(): ReadonlySet<string> | undefined {
  const instances = (process.env.MASTODON_INSTANCES ?? '')
    .split(',')
    .map((instance) => instance.trim().toLowerCase())
    .filter((instance) => instance.length > 0)

  return instances.length > 0 ? new Set(instances) : undefined
}

function parseStatusUrl(statusUrl: string) {
  try {
    return MastodonStatus.parseUrl(statusUrl)
  } catch {
    throw new BadRequestException()
  }
}

function assertAllowedInstance(statusUrl: string) {
  const { instance } = parseStatusUrl(statusUrl)
  const allowedInstances = getAllowedInstances()
  if (allowedInstances && !allowedInstances.has(instance)) {
    throw new ForbiddenException()
  }
}

router.param('statusUrl', async (_req, res, next, statusUrl: string) => {
  try {
    assertAllowedInstance(statusUrl)

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

router.get('/:statusUrl(*).amp', (_req, res) => {
  if (!res.locals.mastodon) {
    throw new NotFoundException()
  }

  res.render('mastodon.html', {
    mastodon: res.locals.mastodon as MastodonStatus,
  })
})

router.get('/:statusUrl(*)', (_req, res, next) => {
  if (!res.locals.mastodon) {
    next()
    return
  }

  res.send(res.locals.mastodon)
})

export const mastodonRouter = router
