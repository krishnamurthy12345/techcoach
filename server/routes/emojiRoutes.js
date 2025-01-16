const express = require('express');
const authMiddleware = require('../Utility/AuthMiddleware');
const createUserKey = require('../Utility/CreateUserKey');
const emojiController = require('../Controllers/emojiController');

const router = express.Router();

router.use(authMiddleware);
router.use(createUserKey);

router.post('/emoji', emojiController.postReactions );
router.get('/emoji/:comment_id', emojiController.getReactions );
router.get('/emoji/decision/:id', emojiController.getAllReactionsByDecision );
router.delete('/emoji/:comment_id/:emoji_id', emojiController.removeReaction );
router.get('/masterEmoji', emojiController.getMasterEmojis );
// router.put('/emoji/edit/:comment_id/:emoji_id', emojiController.editReaction );


module.exports = router;
