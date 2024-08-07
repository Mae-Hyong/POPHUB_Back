const token = require("../function/jwt");
const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");

router.get("/category", adminController.searchCategory);
router.get("/notice", adminController.searchNotice);
router.get("/event", adminController.searchNotice);
router.get("/search_inquiry", adminController.searchInquiry);
router.post("/answer", token.verifyToken, adminController.createAnswer);
router.post("/notice/create", token.verifyToken, adminController.createNotice);
router.get(
    "/popupPendingList",
    token.verifyToken,
    adminController.popupPendingList
); // pendingList 조회
router.put(
    "/popupPendingCheck",
    token.verifyToken,
    adminController.popupPendingCheck
); // 관리자 승인 pending -> check
router.post(
    "/popupPendingDeny",
    token.verifyToken,
    adminController.popupPendingDeny
); // 관리자 승인 deny, 거부 사유 등록
router.post("/event/create", token.verifyToken, adminController.createEvent); // 이벤트 생성
router.post(
    "/popupStore/notification",
    token.verifyToken,
    adminController.createPopupStoreNotification
); // 팝업 스토어 알림 생성

module.exports = router;
