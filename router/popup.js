const express = require('express');
const router = express.Router();
const {popupController} = require('../controllers/popupController');

router.get('/', popupController.allPopups);
router.post('/create', popupController.createPopup);
router.delete('/:store_id', popupController.deletePopup);

module.exports = router;