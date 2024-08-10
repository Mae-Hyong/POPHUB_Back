const token = require('../function/jwt');
const multerimg = require('../function/multer');
const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');

router.get("/category", adminController.searchCategory);
router.get("/notice", adminController.searchNotice);
router.get("/event", adminController.searchNotice);
router.get("/inquiry/search", adminController.searchInquiry);
router.post("/event/create", multerimg.upload.single("file"), adminController.createEvent);
router.post("/answer", token.verifyToken, adminController.createAnswer);
router.post("/notice/create", token.verifyToken, adminController.createNotice);

/**
 * @swagger
 * /admin/popupPendingList:
 *  get:
 *    tags: [admin]
 *    summary: 팝업 pendingList 조회
 *    responses:
 *      200:
 *        description: 성공
 */
router.get('/popupPendingList', adminController.popupPendingList); // pendingList 조회

/**
 * @swagger
 * /admin/popupPendingCheck:
 *   put:
 *     summary: 관리자 승인 pending -> check
 *     tags: [admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               storeId:
 *                 type: string
 *                 description: 변경할 스토어 ID
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_name:
 *                   type: string
 *                   description: 승인된 사용자 이름
 */
router.put('/popupPendingCheck', adminController.popupPendingCheck); // 관리자 승인 pending -> check

/**
 * @swagger
 * /admin/popupPendingDeny:
 *   post:
 *     summary: 관리자 승인 요청 거부 및 거부 사유 등록
 *     tags: [admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               storeId:
 *                 type: string
 *                 description: 거부할 스토어 ID
 *               denialReason:
 *                 type: string
 *                 description: 거부 사유
 *             required:
 *               - storeId
 *               - denialReason
 *     responses:
 *       201:
 *         description: 요청 거부 성공 및 사용자 이름 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_name:
 *                   type: string
 *                   description: 거부된 요청의 사용자 이름
 */
router.post('/popupPendingDeny', adminController.popupPendingDeny); // 관리자 승인 deny, 거부 사유 등록

module.exports = router;