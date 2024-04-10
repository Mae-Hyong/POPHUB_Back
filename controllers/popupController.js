const popupModel = require('../models/popupModel');

const popupController = {
    allPopups: async () => { 
        try {
            const result = await popupModel.allPopups();
            return result;
        } catch (err) {
            console.log(err);
            throw err;
        }
    },

    createPopup: async (req, res) => {
        try {
            const popupData = req.body;
            const result = await popupModel.createPopup(popupData);
            console.log(result.store_id);

            res.status(200).send('성공하였습니다.');

        } catch(err) {
            console.log(err);
            throw err;
        }
    },

    deletePopup: async (req, res) => {
        try{
            const store_id = req.params.store_id;
            await popupModel.deletePopup(store_id);

        } catch(err) {
            console.log(err);
            throw err;
        }
    },
};



module.exports = { popupController }