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

    createSchedule: (store_id, popupSchedules) => {
        return new Promise((resolve, reject) => {
            const promises = [];
            const schedules = popupSchedules.map(schedule => ({ store_id, ...schedule }));
            schedules.forEach(schedule => {
                promises.push(new Promise((innerResolve, innerReject) => {
                    db.query('INSERT INTO store_schedules SET ?', schedule, (err, results) => {
                        if (err) {
                            innerReject(err);
                        } else {
                            innerResolve(results);
                        }
                    });
                }));
            });
    
            Promise.all(promises)
                .then(results => {
                    resolve(results);
                })
                .catch(err => {
                    reject(err);
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

    likePopup: (user_id, store_id) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT store_mark_number FROM popup_stores WHERE store_id = ?';
            db.query('SELECT * FROM BookMark WHERE user_id = ? AND store_id = ?', [user_id, store_id], (err, results) => {
                if (err) return reject(err);
    
                if (results.length > 0) { // 값이 있을 경우, 찜 취소
                    db.query('DELETE FROM BookMark WHERE user_id = ? AND store_id = ?', [user_id, store_id], (err, results) => {
                        if (err) return reject(err);
    
                        db.query('UPDATE popup_stores SET store_mark_number = store_mark_number - 1 WHERE store_id = ?', [store_id], (err, results) => {
                            if (err) return reject(err);

                            db.query(sql, [store_id], (err, results) => {
                                if (err) return reject(err);
    
                                resolve({ message: '찜이 취소되었습니다.', mark_number: results[0].store_mark_number });
                            });
                        });
                    });
                } else { // 찜 추가
                    db.query('INSERT INTO BookMark (user_id, store_id) VALUES (?, ?)', [user_id, store_id], (err, results) => {
                        if (err) return reject(err);
    
                        db.query('UPDATE popup_stores SET store_mark_number = store_mark_number + 1 WHERE store_id = ?', [store_id], (err, results) => {
                            if (err) return reject(err);
    
                            db.query(sql, [store_id], (err, results) => {
                                if (err) return reject(err);
    
                                resolve({ message: '찜이 추가되었습니다.', mark_number: results[0].store_mark_number });
                            });
                        });
                    });
                }
            });
        });
    },
    
    
    
    
};

module.exports = popupModel;
