const express = require('express');
const router = express.Router();
const commentController = require("../Controllers/commentController");
const authMiddleware = require("../Utility/AuthMiddleware");
const createUserKey = require("../Utility/CreateUserKey");

router.use(authMiddleware);
router.use(createUserKey);

// Conversation Routes
router.post('/comments',commentController.postComment);
router.get('/comments/:group_id/:decision_id',commentController.getComments); 
router.get('/comments/:decision_id',commentController.getCommentsByDecisionId); 
router.put('/comments/update', commentController.updateComment);
router.post('/comments/reply', commentController.replyToComment);
router.delete('/comments/:commentId', commentController.deleteComment);


// GroupName Routes
router.post('/decisiongroup',commentController.postdecisionGroup);
router.get('/decisiongroup',commentController.getAlldecisionGroup);
router.get('/decisiongroup/:id',commentController.getDecisionGroup);
router.put('/decisiongroup/:id',commentController.putDecisionGroup);
router.delete('/decisiongroup/:id',commentController.deleteDecisionGroup);


module.exports = router;