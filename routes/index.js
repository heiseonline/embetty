const {Forbidden} = require('../lib/exceptions')
const cors = require('cors')
const debug = require('debug')('embetty.web:server')
const express = require('express')
const tweet = require('./tweet')
const video = require('./video')

const router = express.Router()

function getValidOrigins() {
  const _validOrigins = process.env.VALID_ORIGINS || ''
  return _validOrigins.length > 0 ? _validOrigins.split(',') : []
}

router.use(cors({
  origin: (origin, cb) => {
    const validOrigins = getValidOrigins()
    if (validOrigins[0] === '*' || !origin || validOrigins.indexOf(origin) !== -1) return cb(null, true)

    debug('Invalid origin:', origin, 'Valid:', validOrigins)
    cb(Forbidden)
  }
}))

router.use('/tweet', tweet)
router.use('/video', video)

module.exports = router
