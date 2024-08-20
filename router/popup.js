const express = require('express');
const router = express.Router();
const { popupController } = require('../controllers/popupController');
const multerimg = require('../function/multer');
const token = require('../function/jwt');

/**
 * @swagger
 * /popup/:
 *   get:
 *     tags: [Popup]
 *     summary: 팝업 전체 목록 조회
 *     responses:
 *       200:
 *         description: 성공
 */
router.get('/', popupController.allPopups); // 모든 팝업 조회

/**
 * @swagger
 * /popup/popular:
 *   get:
 *     tags: [Popup]
 *     summary: 인기 팝업 목록 조회
 *     responses:
 *       200:
 *         description: 성공
 */
router.get('/popular', popupController.popularPopups); // 인기 팝업 조회

/**
 * @swagger
 * /popup/view/{storeId}:
 *   get:
 *     tags: [Popup]
 *     summary: 특정 팝업 조회
 *     description: 특정 팝업 조회 & 유저별 북마크 여부
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *         description: storeId
 *       - in: query
 *         name: userName
 *         required: false
 *         schema:
 *           type: string
 *         description: userName (선택 사항)
 *     responses:
 *       200:
 *         description: 성공
 */
router.get('/view/:storeId', popupController.getPopup); // 특정 팝업 조회


/**
 * @swagger
 * /popup/president/{userName}:
 *  get:
 *      tags: [Popup]
 *      summary: 팝업 등록자별 조회
 *      parameters:
 *          - in: path
 *            name: userName
 *            requied: true
 *            schema:
 *              type: string
 *            description: userName
 *      responses:
 *          200:
 *              description: 성공
 */
router.get('/president/:userName', popupController.popupByPresident); // 팝업 등록자별 조회

/**
 * @swagger
 * /popup/scheduledPopups:
 *  get:
 *      tags: [Popup]
 *      summary: 오픈 - 마감 예정 팝업 조회
 *      parameters:
 *          - in: query
 *            name: type
 *            schema:
 *              type: string
 *              enum: [open, close]
 *            required: true
 *      responses:
 *          200:
 *              description: 성공
 */
router.get('/scheduledPopups', popupController.scheduledPopups); // 팝업 오픈 - 마감 예정 팝업 조회

/**
 * @swagger
 * /popup/searchPopups:
 *  get:
 *      tags: [Popup]
 *      summary: 팝업 검색 (이름, 카테고리)
 *      parameters:
 *          - in: query
 *            name: type
 *            schema:
 *              type: string
 *              enum: [storeName, category]
 *            required: true
 *            description: 검색 타입
 *          - in: query
 *            name: storeName
 *            schema:
 *              type: string
 *            required: false
 *            description: "type: storeName일 경우"
 *          - in: query
 *            name: categoryId
 *            schema:
 *              type: string
 *            required: false
 *            description: "type: categoryId일 경우"
 *      responses:
 *          200:
 *              description: 성공
 */
router.get('/searchPopups', popupController.searchPopups); // 스토어 검색

/**
 * @swagger
 * /popup:
 *   post:
 *     tags: [Popup]
 *     summary: 팝업 생성 <-- ** 아직 오류 **
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *               storeName:
 *                 type: string
 *               storeLocation:
 *                 type: string
 *               storeContactInfo:
 *                 type: string
 *               storeDescription:
 *                 type: string
 *               maxCapacity:
 *                 type: integer
 *               storeStartDate:
 *                 type: string
 *                 format: date
 *                 example: '2024-08-01'
 *               storeEndDate:
 *                 type: string
 *                 format: date
 *                 example: '2024-08-15'
 *               schedule:
 *                 type: array
 *                 example: '[{"day_of_week":"Mon","open_time":"09:00","close_time":"17:00"},{"day_of_week":"Tue","open_time":"09:00","close_time":"17:00"}]'
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       '201':
 *         description: Popup store created successfully
 */
router.post('/', multerimg.upload.array("files", 5), popupController.createPopup); // 팝업 생성

/**
 * @swagger
 * /popup/update/{storeId}:
 *   put:
 *     tags: [Popup]
 *     summary: 팝업 수정 <-- ** 아직 오류 **
 *     parameters:
 *       - name: storeId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *               storeName:
 *                 type: string
 *               storeLocation:
 *                 type: string
 *               storeContactInfo:
 *                 type: string
 *               storeDescription:
 *                 type: string
 *               maxCapacity:
 *                 type: integer
 *               storeStartDate:
 *                 type: string
 *                 format: date
 *                 example: '2024-08-01'
 *               storeEndDate:
 *                 type: string
 *                 format: date
 *                 example: '2024-08-15'
 *               schedule[0][day_of_week]:
 *                 type: string
 *                 enum: [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
 *                 example: Mon
 *               schedule[0][open_time]:
 *                 type: string
 *                 format: time
 *                 example: '09:00'
 *               schedule[0][close_time]:
 *                 type: string
 *                 format: time
 *                 example: '17:00'
 *               schedule[1][day_of_week]:
 *                 type: string
 *                 enum: [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
 *                 example: Tue
 *               schedule[1][open_time]:
 *                 type: string
 *                 format: time
 *                 example: '09:00'
 *               schedule[1][close_time]:
 *                 type: string
 *                 format: time
 *                 example: '17:00'
 *               schedule[2][day_of_week]:
 *                 type: string
 *                 enum: [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
 *                 example: Wed
 *               schedule[2][open_time]:
 *                 type: string
 *                 format: time
 *                 example: '09:00'
 *               schedule[2][close_time]:
 *                 type: string
 *                 format: time
 *                 example: '17:00'
 *               schedule[3][day_of_week]:
 *                 type: string
 *                 enum: [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
 *                 example: Thu
 *               schedule[3][open_time]:
 *                 type: string
 *                 format: time
 *                 example: '09:00'
 *               schedule[3][close_time]:
 *                 type: string
 *                 format: time
 *                 example: '17:00'
 *               schedule[4][day_of_week]:
 *                 type: string
 *                 enum: [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
 *                 example: Fri
 *               schedule[4][open_time]:
 *                 type: string
 *                 format: time
 *                 example: '09:00'
 *               schedule[4][close_time]:
 *                 type: string
 *                 format: time
 *                 example: '17:00'
 *               schedule[5][day_of_week]:
 *                 type: string
 *                 enum: [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
 *                 example: Sat
 *               schedule[5][open_time]:
 *                 type: string
 *                 format: time
 *                 example: '09:00'
 *               schedule[5][close_time]:
 *                 type: string
 *                 format: time
 *                 example: '17:00'
 *               schedule[6][day_of_week]:
 *                 type: string
 *                 enum: [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
 *                 example: Sun
 *               schedule[6][open_time]:
 *                 type: string
 *                 format: time
 *                 example: '09:00'
 *               schedule[6][close_time]:
 *                 type: string
 *                 format: time
 *                 example: '17:00'
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       '200':
 *         description: 성공
 */

router.put('/update/:storeId', multerimg.upload.array("files", 5), popupController.updatePopup); // 팝업 수정

/**
 * @swagger
 * /popup/delete/{storeId}:
 *   delete:
 *     tags: [Popup]
 *     summary: 팝업 삭제
 *     parameters:
 *       - name: storeId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: 성공 
 */
router.delete('/delete/:storeId', popupController.deletePopup); // 팝업 삭제

/**
 * @swagger
 * /popup/viewDenialReason/{storeId}:
 *   get:
 *     tags: [Popup]
 *     summary: 팝업 등록 거부 이유 확인
 *     parameters:
 *       - name: storeId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: 성공 
 */
router.get('/viewDenialReason/:storeId', popupController.viewDenialReason); // 팝업 등록 거부 이유 확인

/**
 * @swagger
 * /popup/like/{storeId}:
 *   post:
 *     tags: [Popup]
 *     summary: 팝업 스토어 찜 & 취소
 *     parameters:
 *       - name: storeId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *     responses:
 *       201:
 *         description: 성공

 */
router.post('/like/:storeId', popupController.likePopup); // 팝업 찜 & 취소

/**
 * @swagger
 * /popup/likeUser/{userName}:
 *   get:
 *     tags: [Popup]
 *     summary: 유저별 찜 조회
 *     parameters:
 *       - name: userName
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 성공
 */
router.get('/likeUser/:userName', popupController.likeUser); // 팝업 유저별 찜 조회

/**
 * @swagger
 * /popup/review/create/{storeId}:
 *   post:
 *     tags: [Review]
 *     summary: 팝업 리뷰 작성
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               reviewRating:
 *                 type: integer
 *               reviewContent:
 *                 type: string
 *     responses:
 *       200:
 *         description: 성공
 */
router.post('/review/create/:storeId', popupController.createReview); // 팝업 리뷰 생성

/**
 * @swagger
 * /popup/getReviews:
 *  get:
 *      tags: [Review]
 *      summary: "리뷰 조회 (팝업별 & 아이디별)"
 *      parameters:
 *          - in: query
 *            name: type
 *            required: true
 *            schema:
 *              type: string
 *              enum: [store, user]
 *          - in: query
 *            name: storeId
 *            required: false
 *            schema:
 *              type: string
 *              description: "type: store일 경우"
 *          - in: query
 *            name: userName
 *            required: false
 *            schema:
 *              type: string
 *              description: "type: user일 경우"
 *      responses:
 *          200:
 *              description: 성공
 */
router.get('/getReviews', popupController.storeReview); // 특정 팝업 리뷰 조회

/**
 * @swagger
 * /popup/review/storeReview/{reviewId}:
 *  get:
 *      tags: [Review]
 *      summary: 특정 팝업 리뷰 상세 조회
 *      parameters:
 *          - in: path
 *            name: reviewId
 *            required: true
 *            schema:
 *              type: integer
 *      responses:
 *          200:
 *              description: 성공
 */
router.get('/review/storeReview/:reviewId', popupController.storeReviewDetail); // 특정 팝업 리뷰 상세 조회

/**
 * @swagger
 * /popup/review/update/{reviewId}:
 *   put:
 *     tags: [Review]
 *     summary: 팝업 리뷰 수정
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               reviewRating:
 *                 type: integer
 *               reviewContent:
 *                 type: string
 *     responses:
 *       200:
 *         description: 성공
 */
router.put('/review/update/:reviewId', popupController.updateReview);  // 팝업 리뷰 수정


/**
 * @swagger
 * /popup/review/delete/{reviewId}:
 *  delete:
 *      tags: [Review]
 *      summary: 팝업 리뷰 삭제
 *      parameters:
 *          - in: path
 *            name: reviewId
 *            required: true
 *            schema:
 *              type: integer
 *      responses:
 *          200:
 *              description: 성공
 */
router.delete('/review/delete/:reviewId', popupController.deleteReview); // 팝업 리뷰 삭제


/**
 * @swagger
 * /popup/recommendation/{userName}:
 *   get:
 *     tags: [Recommendation]
 *     summary: 추천 시스템 <-- ** 아직 데이터 부족으로 오류 **
 *     parameters:
 *       - in: path
 *         name: userName
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 추천 데이터
 */
router.get('/recommendation/:userName?', popupController.recommendation); // 추천 시스템

module.exports = router;



// router.post('/reservation/:storeId', popupController.waitReservation); // 예약
// router.get('/reservation/:storeId', popupController.getWaitOrder); // 예약자 대기 순서 조회
// router.get('/waitList', popupController.adminWaitList); // (팝업 등록자) waitList
// router.put('/popupStatus/:storeId', popupController.popupStatus); // (팝업 등록자) 팝업 예약 상태 변경
// router.put('/waitStatus/:wait_id', popupController.waitStatus); // (팝업 등록자)예약자 대기 상태 변경
// router.delete('/waitDelete/:wait_id', popupController.waitDelete); // (팝업 등록자) 예약 삭제