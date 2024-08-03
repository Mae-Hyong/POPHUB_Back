const express = require('express');
const router = express.Router();
const { reservationController } = require('../controllers/reservationController');

router.get('/', reservationController.searchWaitList);
router.post('/wait', reservationController.createWaitList); // 대기 신청
router.post('/admission', reservationController.admissionWaitList);
router.post('/cancel', reservationController.cancelWaitList);
module.exports = router;
