const express = require('express');
const payController = require('../controllers/payController');

const router = express.Router();

router.post('/', payController.payRequest);
router.get('/success', payController.success);
router.get('/fail', payController.fail);
router.get('/cancel', payController.cancel);

module.exports = router;