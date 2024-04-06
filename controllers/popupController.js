const popupModel = require('../models/popupModel');

const popupController = {
    showPopups: (req, res) => {
        popupModel.getPopups((err, result) => {
            if(err) {
                res.status(500).send("에러 발생");
            } else {
                console.log("확인");
            }
        })
    }
}

module.exports = { popupController }