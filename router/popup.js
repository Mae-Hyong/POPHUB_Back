const express = require('express');
const router = express.Router();
const { popupController } = require('../controllers/popupController');
const upload = require('../function/multer');

router.get('/', popupController.allPopups); // 모든 팝업 조회
router.post('/', upload.single("file"), popupController.createPopup); // 팝업 생성
router.get('/:store_id', popupController.getPopup); // 특정 팝업 조회
router.put('/:store_id', popupController.updatePopup); // 팝업 수정
router.delete('/:store_id', popupController.deletePopup); // 팝업 삭제
router.post('/like', popupController.likePopup); // 팝업 찜
router.get('/reviews/:store_id', popupController.storeReview); // 특정 팝업 리뷰 조회
router.get('/review/:review_id', popupController.storeReviewDetail); // 특정 팝업 리뷰 상세 조회
router.post('/review/create/:store_id', popupController.createReview); // 팝업 리뷰 생성
router.put('/review/:review_id', popupController.updateReview);  // 팝업 리뷰 수정
router.delete('/review/:review_id', popupController.deleteReview); // 팝업 리뷰 삭제
router.put('/adminWait/:store_id', popupController.adminWait); // 팝업 관리자 예약 대기 값 변경
router.post('/reservation/:store_id', popupController.waitReservation); // 예약
router.get('/reservation/:store_id', popupController.getWaitOrder); // 예약 조회
module.exports = router;