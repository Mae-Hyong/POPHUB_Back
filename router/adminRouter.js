const token = require("../function/jwt");
const multerimg = require("../function/multer");
const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management and operations
 */

/**
 * @swagger
 * /category:
 *   get:
 *     summary: Get a list of categories
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of categories retrieved successfully
 *       400:
 *         description: Error occurred while retrieving categories
 */
router.get("/category", adminController.searchCategory);

/**
 * @swagger
 * /notice:
 *   get:
 *     summary: Get a list of notices
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of notices retrieved successfully
 *       400:
 *         description: Error occurred while retrieving notices
 */
router.get("/notice", adminController.searchNotice);

/**
 * @swagger
 * /event:
 *   get:
 *     summary: Get a list of events
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of events retrieved successfully
 *       400:
 *         description: Error occurred while retrieving events
 */
router.get("/event", adminController.searchNotice);

/**
 * @swagger
 * /inquiry/search:
 *   get:
 *     summary: Search inquiries
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Inquiries retrieved successfully
 *       400:
 *         description: Error occurred while retrieving inquiries
 */
router.get("/inquiry/search", adminController.searchInquiry);

/**
 * @swagger
 * /event/create:
 *   post:
 *     summary: Create a new event
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Event created successfully
 *       400:
 *         description: Error occurred while creating the event
 */
router.post(
    "/event/create",
    multerimg.upload.single("file"),
    adminController.createEvent
);

/**
 * @swagger
 * /answer:
 *   post:
 *     summary: Create an answer to an inquiry
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inquiryId:
 *                 type: string
 *               answer:
 *                 type: string
 *     responses:
 *       200:
 *         description: Answer created successfully
 *       400:
 *         description: Error occurred while creating the answer
 */
router.post("/answer", token.verifyToken, adminController.createAnswer);

/**
 * @swagger
 * /notice/create:
 *   post:
 *     summary: Create a new notice
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Notice created successfully
 *       400:
 *         description: Error occurred while creating the notice
 */
router.post("/notice/create", token.verifyToken, adminController.createNotice);

/**
 * @swagger
 * /admin/popupPendingList:
 *  get:
 *    tags: [Admin]
 *    summary: 팝업 pendingList 조회
 *    responses:
 *      200:
 *        description: 성공
 */
router.get("/popupPendingList", adminController.popupPendingList); // pendingList 조회

/**
 * @swagger
 * /admin/popupPendingCheck:
 *   put:
 *     summary: 관리자 승인 pending -> check
 *     tags: [Admin]
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
router.put("/popupPendingCheck", adminController.popupPendingCheck); // 관리자 승인 pending -> check

/**
 * @swagger
 * /admin/popupPendingDeny:
 *   post:
 *     summary: 관리자 승인 요청 거부 및 거부 사유 등록
 *     tags: [Admin]
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
router.post("/popupPendingDeny", adminController.popupPendingDeny); // 관리자 승인 deny, 거부 사유 등록
router.post(
    "/popupStore/notification",
    token.verifyToken,
    adminController.createPopupStoreNotification
); // 팝업 스토어 알림 생성

module.exports = router;
