const express = require('express');
const authMiddleware = require('../Utility/AuthMiddleware');
const createUserKey = require('../Utility/CreateUserKey');
const advancedLinkController = require('../Controllers/advancedLinkController');

const router = express.Router();

router.use(authMiddleware);
router.use(createUserKey);

router.post('/advancedLink',advancedLinkController.postAdvancedProfile);
router.get('/advancedLink',advancedLinkController.getAllAdvancedProfileLink);
router.delete('/advancedLink/:id',advancedLinkController.deleteAdvancedProfileLink);


module.exports = router;