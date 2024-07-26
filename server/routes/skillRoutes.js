const express = require('express');
const authMiddleware = require('../Utility/AuthMiddleware');
const createUserKey = require('../Utility/CreateUserKey');
const { postSkill, getAllSkill, getSkill,getSkillNames, putSkill,deleteSkill,deleteAllSkill } = require('../Controllers/skillController');

const router = express.Router();

router.use(authMiddleware);
router.use(createUserKey);

router.post('/', postSkill);
router.get('/', getAllSkill);
router.get('/:id', getSkill);
router.get('/skill-names', getSkillNames);
router.put('/:id', putSkill);
router.delete('/:id', deleteSkill);
router.delete('/', deleteAllSkill);


module.exports = router;