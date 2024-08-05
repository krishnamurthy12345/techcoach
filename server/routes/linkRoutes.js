const express = require('express');
const authMiddleware = require('../Utility/AuthMiddleware');
const createUserKey = require('../Utility/CreateUserKey');
const { postSkillLink,postProfileLink,getAllProfileLink, getAllSkillLink } = require('../Controllers/linkController');

const router = express.Router();

router.use(authMiddleware);
router.use(createUserKey);

router.post('/link', postSkillLink);
router.post('/links', postProfileLink);
router.get('/link', getAllSkillLink);
router.get('/links', getAllProfileLink);

module.exports = router;