import { Router } from 'express'
const router = Router()

import * as UserController from "../Controllers/userController.js"

router.route('/userregister').post(UserController.userRegister)
router.route('/userlogin').post(UserController.login)

export default router;