const express = require('express');
const router = express.Router();
const { qrCodeController } = require('../controllers/qrCodeController');

/**
 * @swagger
 * /qrcode/create:
 *   get:
 *      tags: [QRCode]
 *      summary: QR코드 생성
 *      parameters:
 *        - in: query
 *          name: storeId
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: 성공
 */          
router.get('/create', qrCodeController.createQrCode); // qr코드 생성

/**
 * @swagger
 * /qrcode/delete:
 *   delete:
 *      tags: [QRCode]
 *      summary: QR코드 삭제
 *      parameters:
 *        - in: query
 *          name: storeId
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: 성공
 */
router.delete('/delete', qrCodeController.deleteQrCode); // qr코드 삭제

/**
 * @swagger
 * /qrcode/show:
 *   get:
 *      tags: [QRCode]
 *      summary: QR코드 이미지 조회
 *      parameters:
 *        - in: query
 *          name: storeId
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: 성공
 */ 
router.get('/show', qrCodeController.showQrCode); // qr코드 조회

/**
 * @swagger
 * /qrcode/scan/store:
 *   get:
 *      tags: [QRCode]
 *      summary: QR코드 스캔 - 스토어 조회
 *      parameters:
 *        - in: query
 *          name: qrCode
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: 성공
 */  
router.get('/scan/store', qrCodeController.scanQrCodeForStore); // qr코드 스캔 - 스토어 조회

/**
 * @swagger
 * /qrcode/scan/visit:
 *   put:
 *     tags: [QRCode]
 *     summary: QR코드 스캔 - 방문 인증
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         description: "reservation: 사전 예약, waiting: 현장 대기"
 *         schema:
 *           type: string
 *           enum: [reservation, waiting]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               qrCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: 성공
 */
router.put('/scan/visit', qrCodeController.scanQrCodeForVisit); // qr코드 스캔 - 방문 인증

/**
 * @swagger
 * /qrcode/calendar/show:
 *   get:
 *      tags: [QRCode]
 *      summary: 유저별 캘린더 조회
 *      parameters:
 *        - in: query
 *          name: userName
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: 성공
 */
router.get('/calendar/show', qrCodeController.showCalendar); // 유저별 캘린더 조회

module.exports = router;