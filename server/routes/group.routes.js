const express = require("express");
const router = express.Router();
const groupController = require("../Controllers/group.controller");
const authMiddleware = require("../Utility/AuthMiddleware");
const createUserKey = require("../Utility/CreateUserKey");

router.use(authMiddleware);
router.use(createUserKey);


router.get("/fetchUserList", groupController.getUserList);
router.post("/innerCircleCreation", groupController.innerCircleCreation);
router.get("/checkInnerCircleExists", groupController.checkInnerCircleExists);
router.get("/getInnerCircleDetails",groupController.getInnerCircleDetails);
router.delete("/removeMemberFromInner",groupController.removeMemberFromInner);
router.post("/getAddMemberNameList",groupController.getAddMemberNameList);
router.put("/addMemberInInnerCircle",groupController.addMemberInInnerCircle);
router.post("/shareDecisionInInnerCircle",groupController.shareDecisionInInnerCircle);
router.post("/getSharedMembers",groupController.getSharedMembers);
router.get("/getInnerCircleAcceptNotification",groupController.getInnerCircleAcceptNotification);
router.put("/updateInnerCircleAcceptStatus",groupController.updateInnerCircleAcceptStatus);

module.exports = router;