const db = require('../config/mysqlDatabase');

const popupModel = {
    allPopups: () => { // 모든 팝업 스토어 정보 확인
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM popup_stores', (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        })
    },

    deletePopup: (store_id) => { // 스토어 아이디로 delete 구현
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM popup_stores WHERE store_id = ?', [store_id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    },
};

module.exports = popupModel;
