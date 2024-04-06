const db = require('../config/mysqlDatabase');

const popupModel = {
    getPopups: (callback) => {
        db.query('SELECT * FROM popup_stores', (err, result) => {
            if (err) {
                callback(err, null);
            } else {
                console.log("test okoko");
                callback(null, result);
            }
        })
    }
}

module.exports = popupModel;
