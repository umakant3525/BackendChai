import { Router } from 'express'
import { registerUser } from '../controllers/user.controller.js'

const router = Router()

router.route("/registeruser").post(registerUser)

export default router