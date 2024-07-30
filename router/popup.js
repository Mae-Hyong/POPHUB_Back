const express = require('express');
const router = express.Router();
const { popupController } = require('../controllers/popupController');
const upload = require('../function/multer');
const token = require('../function/jwt');

/**
 * @swagger
 * /popup/:
 *   get:
 *     summary: 모든 팝업 전체 조회
 *     description: 모든 팝업 전체 조회
 *     responses:
 *       200:
 *         description: 성공
 */

/**
 * @swagger
 * /popup/view/{storeId}:
 *   get:
 *     summary: 특정 팝업 조회
 *     description: 특정 storeId와 선택적 userName에 해당하는 팝업을 조회합니다.
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *         description: 조회할 스토어의 ID
 *       - in: query
 *         name: userName
 *         required: false
 *         schema:
 *           type: string
 *         description: 조회할 사용자의 이름 (선택 사항)
 *     responses:
 *       200:
 *         description: 성공
 */

router.get('/', popupController.allPopups); // 모든 팝업 조회
router.get('/view/:storeId', popupController.getPopup); // 특정 팝업 조회
router.get('/popular', popupController.popularPopups); // 인기 팝업 조회
router.get('/president/:userName', popupController.popupByPresident); // 팝업 등록자별 조회
router.get('/scheduledPopups', popupController.scheduledPopups); // 오픈 예정 팝업 조회
router.get('/searchStoreName', popupController.searchStoreName); // 스토어 이름으로 팝업 검색
router.get('/searchCategory/:categoryId', popupController.searchCategory); // 카테고리로 팝업 검색

router.post('/review/create/:storeId', popupController.createReview); // 팝업 리뷰 생성
router.get('/reviews/store/:storeId', popupController.storeReview); // 특정 팝업 리뷰 조회
router.get('/reviews/user/:userName', popupController.storeUserReview); // 특정 아이디별 리뷰 조회
router.get('/review/storeReview/:reviewId', popupController.storeReviewDetail); // 특정 팝업 리뷰 상세 조회
router.put('/review/update/:reviewId', popupController.updateReview);  // 팝업 리뷰 수정
router.delete('/review/delete/:reviewId', popupController.deleteReview); // 팝업 리뷰 삭제


router.post('/', upload.array("files", 5), popupController.createPopup); // 팝업 생성
router.put('/update/:storeId', upload.array("files", 5), popupController.updatePopup); // 팝업 수정
router.delete('/delete/:storeId', popupController.deletePopup); // 팝업 삭제

router.get('/viewDenialReason/:storeId', popupController.viewDenialReason); // 팝업 등록 거부 이유 확인
router.post('/like/:storeId', popupController.likePopup); // 팝업 찜
router.get('/likeUser/:userName', popupController.likeUser); // 팝업 유저별 찜 조회

router.get('/reservationStatus/:storeId', popupController.reservationStatus); // 스토어별 예약 상태
router.post('/reservation/:storeId', popupController.reservation); // 사전 예약
router.get('/getReservation/user/:userName', popupController.getReservationUser); // 예약자 예약 조회
router.get('/getReservation/president/:storeId', popupController.getReservationPresident); // 팝업 등록자 스토어 예약 조회
router.delete('/deleteReservation/:reservationId', popupController.deleteReservation) // 예약 취소

router.get('/recommendation/:userName?', popupController.recommendation); // 추천 시스템
module.exports = router;



// router.post('/reservation/:storeId', popupController.waitReservation); // 예약
// router.get('/reservation/:storeId', popupController.getWaitOrder); // 예약자 대기 순서 조회
// router.get('/waitList', popupController.adminWaitList); // (팝업 등록자) waitList
// router.put('/popupStatus/:storeId', popupController.popupStatus); // (팝업 등록자) 팝업 예약 상태 변경
// router.put('/waitStatus/:wait_id', popupController.waitStatus); // (팝업 등록자)예약자 대기 상태 변경
// router.delete('/waitDelete/:wait_id', popupController.waitDelete); // (팝업 등록자) 예약 삭제