const express = require('express');
const router = express.Router();

const advancedProfileController = require("../Controllers/advancedProfileController");

const authMiddleware = require("../Utility/AuthMiddleware");
const createUserKey = require("../Utility/CreateUserKey");

router.use(authMiddleware);
router.use(createUserKey);

router.get("/advanced",advancedProfileController.getUserList);
router.post("/data/advanced",advancedProfileController.postAdvancedProfile);
router.get("/data/master",advancedProfileController.getMasterProfiles);
router.get("/data/advanced",advancedProfileController.getAdvancedProfile);
router.put("/data/advanced",advancedProfileController.putAdvancedProfile);

module.exports = router;