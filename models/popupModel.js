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

    createPopup: (popupData) => {
        return new Promise((resolve, reject) => {
            db.query('INSERT INTO popup_stores SET ?', popupData, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    const store_id = result.insertId; // 현재 생성된 store_id
                    resolve({ ...popupData, store_id });
                }
            });
        });
    },


    getPopup: (store_id) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM popup_stores WHERE store_id = ?', store_id, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result[0]);
                }
            });
        })
    },

    updatePopup: (store_id, popupData) => {
        return new Promise((resolve, reject) => {
            db.query('UPDATE popup_stores SET ? WHERE store_id = ?', [popupData, store_id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(popupData);
                }
            });
        })
    },

    deletePopup: (store_id) => { // 스토어 아이디로 팝업 정보 삭제
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
