const token = require('../function/jwt');
const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');

router.post("/answer", token.verifyToken, adminController.createAnswer);

module.exports = router;