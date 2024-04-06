const express = require('express');
const router = express.Router();
const {popupController} = require('../controllers/popupController');

router.get('/', popupController.showPopups);

module.exports = router;