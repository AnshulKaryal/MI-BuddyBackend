import { Router } from "express";
const router = Router();

import * as PartnerController from "../Controllers/partnerController.js"

router.route('/partnerregister').post(PartnerController.partnerRegister)
router.route('/partnerlogin').post(PartnerController.partnerLogin)

export default router;