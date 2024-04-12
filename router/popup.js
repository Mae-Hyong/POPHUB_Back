const express = require('express');
const router = express.Router();
const {popupController} = require('../controllers/popupController');

router.get('/', popupController.allPopups);
router.post('/', popupController.createPopup);
router.get('/:store_id', popupController.getPopup);
router.put('/:store_id', popupController.updatePopup);
router.delete('/:store_id', popupController.deletePopup);
router.post('/like', popupController.likePopup);

module.exports = router;