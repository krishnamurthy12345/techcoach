const express = require("express");
const router = express.Router();
const multigroupController = require("../Controllers/multigroupController");
const authMiddleware = require("../Utility/AuthMiddleware");
const createUserKey = require("../Utility/CreateUserKey");

router.use(authMiddleware);
router.use(createUserKey);


router.get("/fetchUserList", multigroupController.getUserList);
router.post("/decisionCircleCreation", multigroupController.decisionCircleCreation);
router.get("/getUserDecisionCircles",multigroupController.getUserDecisionCircles);
// router.get("/getdecisionCircle/:group_id",multigroupController.getdecisionCircle);
router.get("/getdecisionCirclesByUser",multigroupController.getdecisionCirclesByUser);
router.get("/getdecisionCirclesByUserAndMember",multigroupController.getdecisionCirclesByUserAndMember);
// router.get("/getAllGroups", multigroupController.getAllGroups);
router.get("/getUsersForGroup/:groupId", multigroupController.getUsersForGroup);
router.delete("/removeUsersFromGroup/:groupId/:userId", multigroupController.removeUsersFromGroup);
router.post("/sendDecisionCircleInvitation",multigroupController.sendDecisionCircleInvitation);
router.post("/decisionshareDecisionCircle",multigroupController.decisionshareDecisionCircle);
router.get("/getdecisionSharedDecisionCircle/:groupId",multigroupController.getdecisionSharedDecisionCircle);
router.get("/getMemberSharedDecisions/:groupId",multigroupController.getMemberSharedDecisions);
router.get("/getSharedDecisionCircleCount",multigroupController.getSharedDecisionCircleCount);
// router.get("/getSharedDecisionCircleDetails",multigroupController.getSharedDecisionCircleDetails);
router.post("/decisionCirclePostComment",multigroupController.decisionCirclePostComment);
router.post("/decisionCircleReplyComment",multigroupController.decisionCircleReplyComment);


module.exports = router;