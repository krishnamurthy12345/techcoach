const express = require('express');
const router = express.Router();

const advancedProfileController = require("../Controllers/advancedProfileController");

const authMiddleware = require("../Utility/AuthMiddleware");
const createUserKey = require("../Utility/CreateUserKey");

router.use(authMiddleware);
router.use(createUserKey);

router.get("/advanced",advancedProfileController.getUserList);
router.post("/data",advancedProfileController.postAdvancedProfile);
router.get("/data/master",advancedProfileController.getMasterProfiles);
router.get("/data",advancedProfileController.getAdvancedProfile);
router.put("/data",advancedProfileController.putAdvancedProfile);

module.exports = router;