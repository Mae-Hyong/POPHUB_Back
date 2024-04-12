const popupModel = require('../models/popupModel');

const popupController = {
    allPopups: async (req, res) => {
        try {
            const result = await popupModel.allPopups();
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            throw err;
        }
    },

    createPopup: async (req, res) => {
        try {
            const popupData = req.body.popupData;
            const popupSchedules = req.body.popupSchedules;

            const popupDataResult = await popupModel.createPopup(popupData); // 팝업 정보
            const store_id = popupDataResult.store_id;
            await popupModel.createSchedule(store_id, popupSchedules); // 팝업 스케줄 정보

            res.status(200).send(`${store_id}가 등록되었습니다.`);
        } catch (err) {
            console.log(err);
            throw err;
        }
    },

    getPopup: async (req, res) => {
        try {
            const store_id = req.params.store_id;
            const result = await (popupModel.getPopup(store_id));
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            throw err;
        }
    },

    updatePopup: async (req, res) => {
        try {
            const store_id = req.params.store_id;
            const popupData = req.body;
            await popupModel.updatePopup(store_id, popupData);
            res.status(200).send(`${store_id} 수정 완료`);
        } catch (err) {
            console.log(err);
            throw err;
        }
    },

    deletePopup: async (req, res) => {
        try {
            const store_id = req.params.store_id;
            await popupModel.deletePopup(store_id);
            res.status(200).json(`${store_id} 삭제 완료`);

        } catch (err) {
            console.log(err);
            throw err;
        }
    },

    likePopup: async (req, res) => {
        try {
            const { user_id, store_id } = req.body;
            const like = await popupModel.likePopup(user_id, store_id);
            res.status(200).json(like);
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
};

module.exports = { popupController }