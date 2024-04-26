const db = require('../config/mysqlDatabase');

const popupModel = {
    allPopups: async () => { // 모든 팝업 스토어 정보 확인
        try {
            const results = await new Promise((resolve, reject) => {
                db.query('SELECT * FROM popup_stores', (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            });
            return results;
        } catch (err) {
            throw err;
        }
    },

    createPopup: async (popupData) => { // 팝업 스토어 생성
        try {
            const result = await new Promise((resolve, reject) => {
                db.query('INSERT INTO popup_stores SET ?', popupData, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            const store_id = result.insertId; // 현재 생성된 store_id
            return { ...popupData, store_id };
        } catch (err) {
            throw err;
        }
    },

    createSchedule: async (store_id, popupSchedules) => { // 스케줄 생성
        try {
            const promises = [];
            const schedules = popupSchedules.map(schedule => ({ store_id, ...schedule }));
            schedules.forEach(schedule => {
                promises.push(new Promise((resolve, reject) => {
                    db.query('INSERT INTO store_schedules SET ?', schedule, (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                }));
            });

            const results = await Promise.all(promises);
            return results;
        } catch (err) {
            throw err;
        }
    },


    getPopup: async (store_id) => { // 팝업 정보 조회
        try {
            const result = await new Promise((resolve, reject) => {
                db.query('SELECT * FROM popup_stores WHERE store_id = ?', store_id, (err, result) => {
                    if (err) reject(err);
                    else resolve(result[0]);
                });
            });
            return result;
        } catch (err) {
            throw err;
        }
    },

    updatePopup: async (store_id, popupData) => { // 팝업 정보 업데이트
        try {
            await new Promise((resolve, reject) => {
                db.query('UPDATE popup_stores SET ? WHERE store_id = ?', [popupData, store_id], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            return popupData;
        } catch (err) {
            throw err;
        }
    },

    deletePopup: async (store_id) => {
        const tables = ['BookMark', 'products', 'store_review', 'store_schedules', 'popup_stores'];
        try {
            for (const tableName of tables) { // 해당 테이블에 store_id값 확인
                const yes = await new Promise((resolve, reject) => {
                    db.query(`SELECT COUNT(*) AS count FROM ${tableName} WHERE store_id = ?`, [store_id], (err, result) => {
                        if (err) reject(err);
                        else resolve(result[0].count > 0); // 값 존재 여부 반환
                    });
                });

                if (yes) {
                    await new Promise((resolve, reject) => {
                        db.query(`DELETE FROM ${tableName} WHERE store_id = ?`, [store_id], (err, result) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                }
            }
            return true;

        } catch (err) {
            throw err;
        }
    },


    likePopup: async (user_id, store_id) => {
        try {

            const bookmarks = await new Promise((resolve, reject) => {
                db.query('SELECT * FROM BookMark WHERE user_id = ? AND store_id = ?', [user_id, store_id], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            if (bookmarks.length > 0) {
                await new Promise((resolve, reject) => {
                    db.query('DELETE FROM BookMark WHERE user_id = ? AND store_id = ?', [user_id, store_id], (err, results) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                await new Promise((resolve, reject) => {
                    db.query('UPDATE popup_stores SET store_mark_number = store_mark_number - 1 WHERE store_id = ?', [store_id], (err, results) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            } else {
                await new Promise((resolve, reject) => {
                    db.query('INSERT INTO BookMark (user_id, store_id) VALUES (?, ?)', [user_id, store_id], (err, results) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                await new Promise((resolve, reject) => {
                    db.query('UPDATE popup_stores SET store_mark_number = store_mark_number + 1 WHERE store_id = ?', [store_id], (err, results) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            }

            const store_mark_number = await new Promise((resolve, reject) => {
                db.query('SELECT store_mark_number FROM popup_stores WHERE store_id = ?', [store_id], (err, results) => {
                    if (err) reject(err);
                    else resolve(results[0].store_mark_number);
                });
            });

            if (bookmarkResults.length > 0) {
                return { message: '찜이 취소되었습니다.', mark_number: store_mark_number };
            } else {
                return { message: '찜이 추가되었습니다.', mark_number: store_mark_number };
            }
        } catch (err) {
            throw err;
        }
    },

    storeReview: async (store_id) => {
        try {
            const results = await new Promise((resolve, reject) => {
                db.query('SELECT * FROM store_review WHERE store_id = ?', store_id, (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            });
            return results;
        } catch (err) {
            throw err;
        }
    },

    storeReviewDetail: async (review_id) => { // 리뷰 상세 페이지
        try {
            const result = await new Promise((resolve, reject) => {
                db.query('SELECT * FROM store_review WHERE review_id = ?', review_id, (err, result) => {
                    if (err) reject(err);
                    resolve(result[0]);
                });
            });
            return result;
        } catch (err) {
            throw err;
        }
    },

    createReview: async (reviewdata) => { // 리뷰 작성
        try {
            const result = await new Promise((resolve, reject) => {
                db.query('INSERT INTO store_review SET ?', reviewdata, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            const review_id = result.insertId;
            return { ...reviewdata, review_id };
        } catch (err) {
            throw err;
        }
    },

    updateReview: async (reviewdata, review_id) => {
        try {
            await new Promise((resolve, reject) => {
                db.query('UPDATE store_review SET ? WHERE review_id = ?', [reviewdata, review_id], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            return reviewdata;
        } catch (err) {
            throw err;
        }
    },

    deleteReview: async (review_id) => {
        try {
            await new Promise((resolve, reject) => {
                db.query('DELETE FROM store_review WHERE review_id = ?', review_id, (err, result) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        } catch (err) {
            throw err;
        }
    },

};

module.exports = popupModel;
