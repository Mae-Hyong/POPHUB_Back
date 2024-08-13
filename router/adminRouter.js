const token = require('../function/jwt');
const multerimg = require('../function/multer');
const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');

/**
 * @swagger
 * /admin/category:
 *   get:
 *     tags: [Admin]
 *     summary: 카테고리 조회
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 성공
 */
router.get("/category", adminController.searchCategory);

/**
 * @swagger
 * /admin/notice:
 *   get:
 *     tags: [Admin]
 *     summary: 공지사항 조회
 *     parameters:
 *       - in: query
 *         name: notice_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 성공
 */
router.get("/notice", adminController.searchNotice);

/**
 * @swagger
 * /admin/event:
 *   get:
 *     tags: [Admin]
 *     summary: 이벤트 조회
 *     parameters:
 *       - in: query
 *         name: notice_id
 *         schema:
 *           type: string
 *         required: false
 *     responses:
 *       200:
 *         description: 성공
 */
router.get("/event", adminController.searchEvent);

/**
 * @swagger
 * /admin/inquiry/search:
 *   get:
 *     tags: [Admin]
 *     summary: 전체 문의사항 조회
 *     responses:
 *       200:
 *         description: 성공
 */
router.get("/inquiry/search", adminController.searchInquiry);


router.post("/event/create", multerimg.upload.single("file"), adminController.createEvent);
router.post("/answer", token.verifyToken, adminController.createAnswer);

/**
 * @swagger
 * /admin/notice/create:
 *   post:
 *     tags: [Admin]
 *     summary: 공지사항 생성
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               
 *     responses:
 *       201:
 *         description: 성공
 */
router.post("/notice/create", token.verifyToken, adminController.createNotice);

/**
 * @swagger
 * /admin/popupPendingList:
 *  get:
 *    tags: [Admin]
 *    summary: 팝업 pendingList 조회
 *    security:
 *       - ApiKeyAuth: []
 *    responses:
 *      200:
 *        description: 성공
 */
router.get('/popupPendingList', token.verifyToken, adminController.popupPendingList); // pendingList 조회

/**
 * @swagger
 * /admin/popupPendingCheck:
 *   put:
 *     summary: 관리자 승인 pending -> check
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               storeId:
 *                 type: string
 *     responses:
 *       200:
 *         description: 성공
 */
router.put('/popupPendingCheck', token.verifyToken, adminController.popupPendingCheck); // 관리자 승인 pending -> check

/**
 * @swagger
 * /admin/popupPendingDeny:
 *   post:
 *     summary: 관리자 승인 요청 거부 및 거부 사유 등록
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               storeId:
 *                 type: string
 *                 required: true
 *               denialReason:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: 성공
 */
router.post('/popupPendingDeny', token.verifyToken, adminController.popupPendingDeny); // 관리자 승인 deny, 거부 사유 등록
router.post(
    "/popupStore/notification",
    token.verifyToken,
    adminController.createPopupStoreNotification
); // 팝업 스토어 알림 생성

module.exports = router;