import { Router } from 'express'
const router = Router()

import * as UserController from "../Controllers/userController.js"
import * as PartnerController from "../Controllers/parnterController.js"

router.route('/userregister').post(UserController.userRegister)
router.route('/partnerregister').post(PartnerController.partnerRegister)