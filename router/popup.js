const express = require('express');
const router = express.Router();
const { popupController } = require('../controllers/popupController');

router.get('/', popupController.allPopups);
router.post('/', popupController.createPopup);
router.get('/:store_id', popupController.getPopup);
router.put('/:store_id', popupController.updatePopup);
router.delete('/:store_id', popupController.deletePopup);
router.post('/like', popupController.likePopup);
router.get('/reviews/:store_id', popupController.storeReview);
router.get('/review/:review_id', popupController.storeReviewDetail);
router.post('/review/create/:store_id', popupController.createReview);
router.put('/review/:review_id', popupController.updateReview);
router.delete('/review/:review_id', popupController.deleteReview);

module.exports = router;