const express = require("express");
const router = express.Router();
const multigroupController = require("../Controllers/multigroupController");
const authMiddleware = require("../Utility/AuthMiddleware");
const createUserKey = require("../Utility/CreateUserKey");

router.use(authMiddleware);
router.use(createUserKey);


router.get("/fetchUserList", multigroupController.getUserList);
router.post("/decisionCircleCreation", multigroupController.decisionCircleCreation);
router.get("/checkDecisionCircleExists", multigroupController.checkDecisionCircleExists);
router.get("/getDecisionCircleDetails",multigroupController.getDecisionCircleDetails);
router.delete("/removeMemberFromDecision",multigroupController.removeMemberFromDecision);
router.post("/getAddMemberName",multigroupController.getAddMemberNameList);
router.put("/addMemberInDecisionCircle",multigroupController.addMemberInDecisionCircle);
router.get("/getDecisionCircleAcceptNotification",multigroupController.getDecisionCircleAcceptNotification);
router.put("/acceptOrRejectInnerCircle",multigroupController.acceptOrRejectDecisionCircle);
router.post("/decisionCircleInvitation",multigroupController.decisionCircleInvitation);
router.post("/decisionCircleAddInvitation",multigroupController.decisionCircleAddInvitation);

// groupname routes
router.post('/decisiongroup',multigroupController.postdecisionGroup);
router.get('/decisiongroup',multigroupController.getAlldecisionGroup);
router.get('/decisiongroup/:id',multigroupController.getDecisionGroup);
router.put('/decisiongroup/:id',multigroupController.putDecisionGroup);
router.delete('/decisiongroup/:id',multigroupController.deleteDecisionGroup);
module.exports = router;