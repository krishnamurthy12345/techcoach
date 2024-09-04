const express = require('express');
const authMiddleware = require('../Utility/AuthMiddleware');
const createUserKey = require('../Utility/CreateUserKey');
const { getUserList, decisionCircleCreation, checkDecisionCircleExists, removeMemberFromCircle } = require('../Controllers/multigroupController');

const router = express.Router();

router.use(authMiddleware);
router.use(createUserKey);

router.get('/fetchUser',getUserList);
router.post('/circle',decisionCircleCreation);
router.get('/checkDecisionCircleExists',checkDecisionCircleExists);
router.delete('/removeMemberFromCircle',removeMemberFromCircle);


module.exports = router;