const express = require('express');
const jwt = require('jsonwebtoken');
const getConnection = require('../Models/database');
const {postInfo,getallInfo,getInfo, putInfo,deleteInfo} =require('../Controllers/decisionControllers')
const router = express.Router();

router.post('/details', postInfo);

router.get('/details', getallInfo);

router.get('/details/:id', getInfo);

router.put('/details/:id', putInfo);

router.delete('/details/:id', deleteInfo);

module.exports = router;
