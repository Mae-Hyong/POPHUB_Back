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

    createPopup: (popupData) => { //  팝업스토어 생성
        return new Promise((resolve, reject) => {
            const { category_id, store_name, store_location, store_contact_info, store_description, store_status, store_image, store_artist_name, store_start_date, store_end_date } = popupData;
            const values = [category_id, store_name, store_location, store_contact_info, store_description, store_status, store_image, store_artist_name, store_start_date, store_end_date];
    
            const sql = 'INSERT INTO popup_stores (category_id, store_name, store_location, store_contact_info, store_description, store_status, store_image, store_artist_name, store_start_date, store_end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            
            db.query(sql, values, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    const store_id = result.insertId; // 현재 생성된 store_id
                    resolve({...popupData, store_id});
                    
                }
            });
        });
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
