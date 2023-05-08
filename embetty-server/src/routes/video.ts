import { Router } from 'express'
import facebook from './video/facebook'
import vimeo from './video/vimeo'
import youtube from './video/youtube'

const router: Router = Router()

router.use('/youtube', youtube)
router.use('/vimeo', vimeo)
router.use('/facebook', facebook)

export default router
