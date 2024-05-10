const db = require('../config/mysqlDatabase');

// ------- GET Query -------
const allPopups_query = 'SELECT * FROM popup_stores';
const getPopup_query = 'SELECT * FROM popup_stores WHERE store_id = ?';
const createSchedule_query = 'INSERT INTO store_schedules SET ?';
const storeReview_query = 'SELECT * FROM store_review WHERE store_id = ?';
const storeReviewDetail_query = 'SELECT * FROM store_review WHERE review_id = ?';
const likePopupSelect_query = 'SELECT * FROM BookMark WHERE user_id = ? AND store_id = ?';
const likePopupCheck_query = 'SELECT store_mark_number FROM popup_stores WHERE store_id = ?';


// ------- POST Query -------
const createReview_query = 'INSERT INTO store_review SET ?';
const createPopup_query = 'INSERT INTO popup_stores SET ?';
const likePopupInsert_query = 'INSERT INTO BookMark (user_id, store_id) VALUES (?, ?)';

// ------- PUT Query -------
const updatePopup_query = 'UPDATE popup_stores SET ? WHERE store_id = ?';
const updateReview_query = 'UPDATE store_review SET ? WHERE review_id = ?';
const likePopupUpdateMinus_query = 'UPDATE popup_stores SET store_mark_number = store_mark_number - 1 WHERE store_id = ?';
const likePopupUpdatePlus_query = 'UPDATE popup_stores SET store_mark_number = store_mark_number + 1 WHERE store_id = ?';
const updateViewCount_query = 'UPDATE popup_stores SET store_view_count = store_view_count + 1 WHERE store_id = ?';
const updateWaitStatus_query = 'UPDATE popup_stores SET store_wait_status = ? WHERE store_id = ?';
// ------- DELETE Query -------
const deleteReview_query = 'DELETE FROM store_review WHERE review_id = ?';
const likePopupDelete_query = 'DELETE FROM BookMark WHERE user_id = ? AND store_id = ?';

const popupModel = {
    allPopups: async () => { // 모든 팝업 스토어 정보 확인
        try {
            const results = await new Promise((resolve, reject) => {
                db.query(allPopups_query, (err, results) => {
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
                db.query(createPopup_query, popupData, (err, result) => {
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

    createSchedule: async (store_id, popupSchedule) => { // 스케줄 생성
        try {
            const promises = [];
            const schedules = popupSchedule.map(schedule => ({ store_id, ...schedule }));
            schedules.forEach(schedule => {
                promises.push(new Promise((resolve, reject) => {
                    db.query(createSchedule_query, schedule, (err, results) => {
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


    getPopup: async (store_id) => { // 하나의 팝업 정보 조회
        try {
            const result = await new Promise((resolve, reject) => {
                db.query(updateViewCount_query, store_id, (err, updateResult) => {
                    if (err) {
                        reject(err);
                    } else {
                        db.query(getPopup_query, store_id, (err, popupResult) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(popupResult[0]);
                            }
                        });
                    }
                });
            });
            return result;
        } catch (err) {
            throw err;
        }
    },

    updatePopup: async (store_id, popupData) => { // 팝업 정보 수정
        try {
            await new Promise((resolve, reject) => {
                db.query(updatePopup_query, [popupData, store_id], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            return popupData;
        } catch (err) {
            throw err;
        }
    },

    deletePopup: async (store_id) => { // 팝업 정보 삭제
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


    likePopup: async (user_id, store_id) => { // 팝업 찜
        try {

            const bookmarks = await new Promise((resolve, reject) => {
                db.query(likePopupSelect_query, [user_id, store_id], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            if (bookmarks.length > 0) {
                await new Promise((resolve, reject) => {
                    db.query(likePopupDelete_query, [user_id, store_id], (err, results) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                await new Promise((resolve, reject) => {
                    db.query(likePopupUpdateMinus_query, [store_id], (err, results) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            } else {
                await new Promise((resolve, reject) => {
                    db.query(likePopupInsert_query, [user_id, store_id], (err, results) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                await new Promise((resolve, reject) => {
                    db.query(likePopupUpdatePlus_query, [store_id], (err, results) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            }

            const store_mark_number = await new Promise((resolve, reject) => {
                db.query(likePopupCheck_query, [store_id], (err, results) => {
                    if (err) reject(err);
                    else resolve(results[0].store_mark_number);
                });
            });

            if (bookmarks.length > 0) {
                return { message: '찜이 취소되었습니다.', mark_number: store_mark_number };
            } else {
                return { message: '찜이 추가되었습니다.', mark_number: store_mark_number };
            }
        } catch (err) {
            throw err;
        }
    },

    storeReview: async (store_id) => { // 팝업 스토어 리뷰
        try {
            const results = await new Promise((resolve, reject) => {
                db.query(storeReview_query, store_id, (err, results) => {
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
                db.query(storeReviewDetail_query, review_id, (err, result) => {
                    if (err) reject(err);
                    resolve(result[0]);
                });
            });
            return result;
        } catch (err) {
            throw err;
        }
    },

    createReview: async (reviewdata) => { // 리뷰 생성
        try {
            const result = await new Promise((resolve, reject) => {
                db.query(createReview_query, reviewdata, (err, result) => {
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

    updateReview: async (reviewdata, review_id) => { // 리뷰 수정
        try {
            await new Promise((resolve, reject) => {
                db.query(updateReview_query, [reviewdata, review_id], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            return reviewdata;
        } catch (err) {
            throw err;
        }
    },

    deleteReview: async (review_id) => { // 리뷰 삭제
        try {
            await new Promise((resolve, reject) => {
                db.query(deleteReview_query, review_id, (err, result) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        } catch (err) {
            throw err;
        }
    },

    adminWait: async (user_id, store_id) => { // 대기 상태 변경
        try {
            const result = await new Promise((resolve, reject) => {
                db.query(getPopup_query, store_id, (err, result) => {
                    if (err) reject(err);
                    else resolve(result[0]);

                });
            });
            const newWaitStatus = result.store_wait_status === 'false' ? 'true' : 'false';

            await new Promise((resolve, reject) => {
                db.query(updateWaitStatus_query, [newWaitStatus, store_id], (err, result) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            
            return newWaitStatus;

        } catch (err) {
            throw err;
        }
    }

};

module.exports = popupModel;
