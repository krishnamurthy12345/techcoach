const express = require('express');
const authMiddleware = require('../Utility/AuthMiddleware');
const createUserKey = require('../Utility/CreateUserKey');
const router = express.Router();
const mobileNumberController = require('../Controllers/mobile_numberController');

router.use(authMiddleware);
router.use(createUserKey);

router.post('/mobile',mobileNumberController.postMobileInfo);
router.get('/',mobileNumberController.getMobileInfo);
router.post('/rating',mobileNumberController.postRatingInfo);

module.exports = router;