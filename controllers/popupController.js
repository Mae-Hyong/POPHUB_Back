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
            const popupData = req.body;
            const result = await popupModel.createPopup(popupData);
            res.status(200).json(result);

        } catch(err) {
            console.log(err);
            throw err;
        }
    },

    getPopup: async (req, res) => {
        try {
            const store_id = req.params.store_id;
            const result = await(popupModel.getPopup(store_id));
            res.status(200).json(result);
        } catch(err) {
            console.log(err);
            throw err;
        }
    },

    deletePopup: async (req, res) => {
        try{
            const store_id = req.params.store_id;
            await popupModel.deletePopup(store_id);
            res.status(200).json(`${store_id} 삭제 완료`);

        } catch(err) {
            console.log(err);
            throw err;
        }
    },
};



module.exports = { popupController }