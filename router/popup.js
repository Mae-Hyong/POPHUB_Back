const express = require('express');
const router = express.Router();
const { popupController } = require('../controllers/popupController');
const upload = require('../function/multer');
const token = require('../function/jwt');


router.get('/', popupController.allPopups); // 모든 팝업 조회
router.get('/view/:store_id', popupController.getPopup); // 특정 팝업 조회
router.get('/popular',popupController.popularPopups); // 인기 팝업 조회

router.post('/review/create/:store_id', popupController.createReview); // 팝업 리뷰 생성
router.get('/reviews/store/:store_id', popupController.storeReview); // 특정 팝업 리뷰 조회
router.get('/reviews/user', popupController.storeUserReview); // 특정 아이디별 리뷰 조회
router.get('/review/storeReview/:review_id', popupController.storeReviewDetail); // 특정 팝업 리뷰 상세 조회
router.put('/review/update/:review_id', popupController.updateReview);  // 팝업 리뷰 수정
router.delete('/review/delete/:review_id', popupController.deleteReview); // 팝업 리뷰 삭제


router.post('/', upload.array("files", 5), popupController.createPopup); // 팝업 생성
router.put('/update/:store_id',upload.array("files", 5), popupController.updatePopup); // 팝업 수정
router.delete('/delete/:store_id', popupController.deletePopup); // 팝업 삭제

router.get('/viewDenialReason/:store_id', popupController.viewDenialReason); // 팝업 등록 거부 이유 확인
router.post('/like/:store_id', popupController.likePopup); // 팝업 찜

router.post('/reservation/:store_id', popupController.waitReservation); // 예약
router.get('/reservation/:store_id', popupController.getWaitOrder); // 예약자 대기 순서 조회
router.get('/waitList', popupController.adminWaitList); // (팝업 등록자) waitList
router.put('/popupStatus/:store_id', popupController.popupStatus); // (팝업 등록자) 팝업 예약 상태 변경
router.put('/waitStatus/:wait_id', popupController.waitStatus); // (팝업 등록자)예약자 대기 상태 변경
router.delete('/waitDelete/:wait_id', popupController.waitDelete); // (팝업 등록자) 예약 삭제

router.post('/booking', popupController.booking); // 사전 예약
module.exports = router;
