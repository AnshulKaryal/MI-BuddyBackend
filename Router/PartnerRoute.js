import { Router } from "express";
const router = Router();

import * as PartnerController from "../Controllers/parnterController.js"

router.route('/partnerregister').post(PartnerController.partnerRegister)

export default router;