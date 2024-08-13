const express = require('express');
const router = express.Router();
const { reservationController } = require('../controllers/reservationController');

/**
 * @swagger
 * /reservation/:
 *  get:
 *      tags: [Waiting - 현장 대기]
 *      summary: 현장 대기 목록 조회
 *      parameters:
 *          - in: query
 *            name: userName
 *            required: true
 *            schema:
 *              type: string
 *          - in: query
 *            name: storeId
 *            required: true
 *            schema:
 *              type: string
 *      responses:
 *          200:
 *              description: 성공
 */
router.get('/', reservationController.searchWaitList);

/**
 * @swagger
 * /reservation/wait:
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
router.post('/wait', reservationController.createWaitList); // 대기 신청

/**
 * @swagger
 * /reservation/admission:
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
 *                          userName:
 *                              type: string
 *                          storeId:
 *                              type: string
 *      responses:
 *          201:
 *              description: 성공
 */
router.put('/admission', reservationController.admissionWaitList);

/** 
 * @swagger
 * /reservation/cancel:
 *  delete:
 *      tags: [Waiting - 현장 대기]
 *      summary: 현장 대기 취소
 *      parameters:
 *          - in: query
 *            name: userName
 *            required: true
 *            schema:
 *              type: string
 *          - in: query
 *            name: storeId
 *            required: true
 *            schema:
 *              type: string
 *      responses:
 *          200:
 *              description: 성공
 *      
*/
router.delete('/cancel', reservationController.cancelWaitList);
module.exports = router;