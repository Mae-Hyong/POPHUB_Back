const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');

router.post("/answer", adminController.createAnswer);

module.exports = router;