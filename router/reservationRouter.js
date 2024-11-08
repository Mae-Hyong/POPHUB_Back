const express = require('express');
const router = express.Router();
const { reservationController } = require('../controllers/reservationController');
/**
 * @swagger
 * /reservation/advance/status/{storeId}:
 *   get:
 *     tags: [Reservation - 사전 예약]
 *     summary: 스토어별 예약 상태
 *     parameters:
 *       - name: storeId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 성공
 */
router.get('/advance/status/:storeId', reservationController.reservationStatus); // 스토어별 예약 상태

/**
 * @swagger
 * /reservation/advance:
 *   post:
 *     tags: [Reservation - 사전 예약]
 *     summary: 사전 예약 등록
 *     parameters:
 *       - in: query
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
 *               reservationDate:
 *                 type: string
 *                 format: date
 *                 example: '2024-08-15'
 *               reservationTime:
 *                 type: string
 *                 format: time
 *                 example: '11:00'
 *               capacity:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       201:
 *         description: 예약 성공
 */
router.post('/advance', reservationController.reservation); // 사전 예약

/**
 * @swagger
 * /reservation/advance/show:
 *  get:
 *      tags: [Reservation - 사전 예약]
 *      summary: "사전 예약 조회 (예약자 & 판매자)"
 *      parameters:
 *          - in: query
 *            name: type
 *            required: true
 *            schema:
 *              type: string
 *              enum: [user, president]
 *          - in: query
 *            name: userName
 *            required: false
 *            schema:
 *              type: string
 *            description: "type: user일 경우"
 *          - in: query
 *            name: storeId
 *            required: false
 *            schema:
 *              type: string
 *            description: "type: president일 경우"
 *      responses:
 *          200:
 *              description: 성공
 */
router.get('/advance/show', reservationController.getReservation); // 예약자 - 판매자 예약 조회

/**
 * @swagger
 * /reservation/advance/complete:
 *  put:
 *    tags: [Reservation - 사전 예약]
 *    summary: "사전 예약 입장 수락"
 *    parameters:
 *      - in: query
 *        name: reservationId
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: 성공
 */
router.put('/advance/complete', reservationController.completedReservation); // 사전 예약 입장 수락

/**
 * @swagger
 * /reservation/advance/delete/{reservationId}:
 *  delete:
 *      tags: [Reservation - 사전 예약]
 *      summary: 사전 예약 취소
 *      parameters:
 *          - in: path
 *            name: reservationId
 *            required: true
 *            schema:
 *              type: string
 *      responses:
 *          200:
 *            description: 성공
 */
router.delete('/advance/delete/:reservationId', reservationController.deleteReservation) // 예약 취소

/**
 * @swagger
 * /reservation/waiting/show:
 *  get:
 *      tags: [Waiting - 현장 대기]
 *      summary: 현장 대기 목록 조회 - 예약자
 *      parameters:
 *          - in: query
 *            name: userName
 *            schema:
 *              type: string
 *          - in: query
 *            name: storeId
 *            schema:
 *              type: string
 *      responses:
 *          200:
 *              description: 성공
 */
router.get('/waiting/show', reservationController.searchWaitList);


/**
 * @swagger
 * /reservation/waiting/popup:
 *  get:
 *      tags: [Waiting - 현장 대기]
 *      summary: 현장 대기 목록 조회 - 판매자
 *      parameters:
 *          - in: query
 *            name: storeId
 *            required: true
 *            schema:
 *              type: string
 *      responses:
 *          200:
 *              description: 성공
 */
router.get('/waiting/popup', reservationController.searchWaitListPopup);

/**
 * @swagger
 * /reservation/advance/show:
 *  get:
 *      tags: [Reservation - 사전 예약]
 *      summary: "사전 예약 조회 (예약자 & 판매자)"
 *      parameters:
 *          - in: query
 *            name: type
 *            required: true
 *            schema:
 *              type: string
 *              enum: [user, president]
 *          - in: query
 *            name: userName
 *            required: false
 *            schema:
 *              type: string
 *            description: "type: userName일 경우"
 *          - in: query
 *            name: storeId
 *            required: false
 *            schema:
 *              type: string
 *            description: "type: president일 경우"
 *      responses:
 *          200:
 *              description: 성공
 */

/**
 * @swagger
 * /reservation/waiting:
 *  post:
 *      tags: [Waiting - 현장 대기]
 *      summary: 현장 대기 신청
 *      requestBody:
 *          required: true
 *          content:
 *              application/x-www-form-urlencoded:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          userName:
 *                              type: string
 *                          storeId:
 *                              type: string
 *                          capacity:
 *                              type: integer
 *      responses:
 *          201:
 *              description: 성공
 */
router.post('/waiting', reservationController.createWaitList); // 대기 신청


/**
 * @swagger
 * /reservation/waiting/create:
 *  post:
 *      tags: [Waiting - 현장 대기]
 *      summary: 현장 대기 신청 ( 전화번호 추가 ver )
 *      requestBody:
 *          required: true
 *          content:
 *              application/x-www-form-urlencoded:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          userName:
 *                              type: string
 *                          storeId:
 *                              type: string
 *                          capacity:
 *                              type: integer
 *                          phoneNumber:
 *                              type: string
 *                              example: "010-1234-5678"
 *      responses:
 *          201:
 *              description: 성공
 */
router.post('/waiting/create', reservationController.createWaiting); // 대기 신청


/**
 * @swagger
 * /reservation/waiting/admission:
 *  put:
 *      tags: [Waiting - 현장 대기]
 *      summary: 현장 대기 입장 수락
 *      requestBody:
 *          required: true
 *          content:
 *              application/x-www-form-urlencoded:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          reservationId:
 *                              type: string
 *      responses:
 *          201:
 *              description: 성공
 */
router.put('/waiting/admission', reservationController.admissionWaitList);

/** 
 * @swagger
 * /reservation/waiting/cancel:
 *  delete:
 *      tags: [Waiting - 현장 대기]
 *      summary: 현장 대기 취소
 *      parameters:
 *          - in: query
 *            name: reservationId
 *            required: true
 *            schema:
 *              type: string
 *      responses:
 *          200:
 *              description: 성공
 */
router.delete('/waiting/cancel', reservationController.cancelWaitList);
module.exports = router;