const express = require('express');
const router = express.Router();
const { deliveryController } = require('../controllers/deliveryController');

/**
 * @swagger
 * /delivery/address/show/{userName}:
 *   get:
 *     tags: [Delivery]
 *     summary: 유저별 주소 조회
 *     parameters:
 *       - in: path
 *         name: userName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 성공
 */
router.get('/address/show/:userName', deliveryController.showAddress); // 유저별 주소 조회

/**
 * @swagger
 * /delivery/address/create:
 *   post:
 *     tags: [Delivery]
 *     summary: 주소 등록
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: 성공 
 */
router.post('/address/create', deliveryController.createAddress); // 주소 등록

/**
 * @swagger
 * /delivery/address/update:
 *   put:
 *     tags: [Delivery]
 *     summary: 주소 수정
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               addressId:
 *                 type: integer
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: 성공 
 */
router.put('/address/update', deliveryController.updateAddress); // 주소 수정

/**
 * @swagger
 * /delivery/address/delete/{addressId}:
 *   delete:
 *     tags: [Delivery]
 *     summary: 주소 삭제
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 성공
 */
router.delete('/address/delete/:addressId', deliveryController.deleteAddress); // 주소 삭제

/**
 * @swagger
 * /delivery/:
 *   post:
 *     tags: [Delivery]
 *     summary: 배송 주문
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               addressId:
 *                 type: string
 *                 description: 선택한 주소 ID
 *               storeId:
 *                 type: string
 *               productId:
 *                 type: string
 *               paymentAmount:
 *                 type: integer
 *                 description: 주문 금액
 *               quantity:
 *                 type: integer
 *                 description: 주문 수량
 *     responses:
 *       201:
 *         description: 성공
 */
router.post('/', deliveryController.createDelivery); // 배송 주문 생성

/**
 * @swagger
 * /delivery/cancel:
 *   put:
 *     tags: [Delivery]
 *     summary: 배송 주문 취소
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               deliveryId:
 *                 type: string
 *                 description: 배송 ID
 *                 required: true
 *               cancelReason:
 *                 type: string
 *                 enum: [고객 변심, 상품 문제, 배송 지연, 기타]
 *                 required: true
 *     responses:
 *       200:
 *         description: 성공
 */
router.put('/cancel', deliveryController.cancelDelivery) // 배송 주문 취소

/**
 * @swagger
 * /delivery/show/user:
 *   get:
 *     tags: [Delivery]
 *     summary: 배송 주문 조회 - 주문자
 *     parameters:
 *       - in: query
 *         name: userName
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         required: true
 *         description: 전체, 주문 완료, 주문 취소, 배송중, 배송 완료 순서
 *         schema:
 *           type: string
 *           enum: [All, Order Completed, Order Canceled, Shipping, Delivered]
 *     responses:
 *       200:
 *         description: 성공
 */
router.get('/show/user', deliveryController.showUserDelivery) // 배송 주문 조회 - 주문자

module.exports = router;