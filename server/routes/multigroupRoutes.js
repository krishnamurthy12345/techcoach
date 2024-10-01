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
router.get("/getAllGroups", multigroupController.getAllGroups);
router.get("/getUsersForGroup/:groupId", multigroupController.getUsersForGroup);
router.delete("/removeUsersFromGroup/:groupId/:userId", multigroupController.removeUsersFromGroup);
router.post("/decisionshareDecisionCircle",multigroupController.decisionshareDecisionCircle);
router.get("/getdecisionSharedDecisionCircle",multigroupController.getdecisionSharedDecisionCircle);
router.post("/decisionCircleInvitation",multigroupController.decisionCircleInvitation);
router.post("/sendDecisionCircleInvitation",multigroupController.sendDecisionCircleInvitation);

// groupname routes
router.post('/decisiongroup',multigroupController.postdecisionGroup);
router.get('/decisiongroup',multigroupController.getAlldecisionGroup);
router.get('/decisiongroup/:id',multigroupController.getDecisionGroup);
router.put('/decisiongroup/:id',multigroupController.putDecisionGroup);
router.delete('/decisiongroup/:id',multigroupController.deleteDecisionGroup);
module.exports = router;