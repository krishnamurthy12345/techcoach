const express = require('express');
const authMiddleware = require('../Utility/AuthMiddleware');
const createUserKey = require('../Utility/CreateUserKey');
const router = express.Router();
const mobileNumberController = require('../Controllers/mobile_numberController');

router.use(authMiddleware);
router.use(createUserKey);

router.post('/mobile',mobileNumberController.postMobileInfo);
router.get('/mobile',mobileNumberController.getMobileInfo);
router.put('/mobile',mobileNumberController.updateMobileInfo);
router.post('/rating',mobileNumberController.postRatingInfo);
router.get('/rating/:id',mobileNumberController.getRatingInfo);
router.put('/rating/edit/:id',mobileNumberController.putRatingInfo);
router.get('/rating/overall/:id',mobileNumberController.getOverallRating);

module.exports = router;