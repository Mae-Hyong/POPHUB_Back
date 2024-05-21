const token = require('../function/jwt');
const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');

router.post("/answer", token.verifyToken, adminController.createAnswer);
router.get('/popupPendingList', adminController.popupPendingList); // pendingList 조회
router.put('/popupPendingCheck', adminController.popupPendingCheck); // 관리자 승인 pending -> check
router.post('/popupPendingDeny', adminController.popupPendingDeny); // 관리자 승인 deny, 거부 사유 등록
module.exports = router;