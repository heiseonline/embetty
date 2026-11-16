import debug_ from 'debug'
import { NextFunction, Request, Response } from 'express'
import { ForbiddenException } from '../exceptions'
import { HttpStatus } from '../http-status'

const debug = debug_('embetty-server:cors')

function validOrigins(): readonly string[] {
  return (process.env.VALID_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0)
}

/**
 * Cross-origin requests are allowed from VALID_ORIGINS (`*` for any) and
 * refused otherwise; requests without an Origin header pass. Only GET is
 * served, so preflights merely confirm that.
 */
export function cors(req: Request, res: Response, next: NextFunction) {
  const origin = req.get('Origin')
  res.vary('Origin')

  if (origin === undefined) {
    next()
    return
  }

  const allowed = validOrigins()
  if (allowed[0] !== '*' && !allowed.includes(origin)) {
    debug('Invalid origin:', origin, 'Valid:', allowed)
    next(new ForbiddenException())
    return
  }

  res.set('Access-Control-Allow-Origin', origin)
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, HEAD')
    res.sendStatus(HttpStatus.NO_CONTENT)
    return
  }
  next()
}
