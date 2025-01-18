const express = require('express');

const authMiddleware = require('../Utility/AuthMiddleware');
const createUserKey = require('../Utility/CreateUserKey');
const commentsRatingController = require('../Controllers/commentsRatingController');

const router = express.Router();

router.use(authMiddleware);
router.use(createUserKey);

router.post('/commentRating',commentsRatingController.postCommentRating);
router.get('/commentRating/:id',commentsRatingController.getCommentRating);
router.put('/commentRating/edit/:id',commentsRatingController.putCommentRating);
router.get('/commentRating/overAll/:id',commentsRatingController.getOverallCommentRating);

module.exports = router;