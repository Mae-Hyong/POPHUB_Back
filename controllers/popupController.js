const popupModel = require('../models/popupModel');

const popupController = {
    allPopups: async () => {
        try {
            const result = await popupModel.allPopups();
            return result;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    deletePopup: async (req, res) => {
        try{
            const store_id = req.params.store_id;
            await popupModel.deletePopup(store_id);

        } catch(err) {
            console.log(err);
        }
    },
};



module.exports = { popupController }