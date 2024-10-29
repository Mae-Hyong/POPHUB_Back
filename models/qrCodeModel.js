const db = require('../config/mysqlDatabase');

// ------- GET Query -------
const popupExists_query = 'SELECT * FROM popup_stores WHERE store_id = ?';
const qrCodeExistsQuery = 'SELECT * FROM qrcodes WHERE store_id = ?';
const scanQrCode_query = 'SELECT * FROM qrcodes WHERE qrcode_id = ?';
const reservationCheck_query = 'SELECT * FROM reservation WHERE store_id = ? AND reservation_id = ? AND reservation_status = "pending"';
const waitListCheck_query = 'SELECT * FROM wait_list WHERE store_id = ? AND reservation_id = ? AND status = "pending"';
const showCalendar_query = 'SELECT * FROM calendar WHERE user_name = ?';
const showStore_query = 'SELECT store_name FROM popup_stores WHERE store_id = ?';
const showImages_query = 'SELECT image_url FROM images WHERE store_id = ?';

// ------- POST Query -------
const insertQrCode_query = 'INSERT INTO qrcodes SET ?';
const createCalendar_query = 'INSERT INTO calendar SET ?';

// ------- PUT Query -------
const reservationForVisit_query = 'UPDATE reservation SET reservation_status = "completed" WHERE reservation_id = ?';
const waitingForVisit_query = 'UPDATE wait_list SET status = "completed" WHERE reservation_id = ?';

// ------- DELETE Query -------
const deleteQrCode_query = 'DELETE FROM qrcodes WHERE store_id = ?';

const qrCodeModel = {

    // QR 코드 체크
    checkQrCode: async (store_id) => {
        try {
            const popupExists = await new Promise((resolve, reject) => {
                db.query(popupExists_query, store_id, (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            });

            if (popupExists.length === 0) { return null; }

            const qrCodeExists = await new Promise((resolve, reject) => {
                db.query(qrCodeExistsQuery, store_id, (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            });
            return qrCodeExists;
        } catch (err) {
            throw err;
        }
    },

    // QR 코드 생성
    createQrCode: async (qrCodeData) => {
        try {
            await new Promise((resolve, reject) => {
                db.query(insertQrCode_query, qrCodeData, (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                })
            })
        } catch (err) {
            throw err;
        }
    },

    // QR 코드 삭제
    deleteQrCode: async (store_id) => {
        try {
            await new Promise((resolve, reject) => {
                db.query(deleteQrCode_query, store_id, (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                })
            })
        } catch (err) {
            throw err;
        }
    },

    // QR 코드 조회
    showQrCode: async (store_id) => {
        try {
            const result = await new Promise((resolve, reject) => {
                db.query(qrCodeExistsQuery, store_id, (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                })
            })
            return result;
        } catch (err) {
            throw err;
        }
    },

    // QR 코드 스캔
    scanQrCodeForStore: async (qrcode_url) => {
        try {
            const result = await new Promise((resolve, reject) => {
                db.query(scanQrCode_query, qrcode_url, (err, results) => {
                    if (err) reject(err);
                    if (!results.length || !results[0].store_id) {
                        return resolve(null);
                    }
                    resolve(results[0].store_id);
                })
            })

            return result;
        } catch (err) {
            throw err;
        }
    },

    // 사전 예약 방문 인증
    reservationForVisit: async (store_id, reservationId) => {
        try {
            const results = await new Promise((resolve, reject) => {
                db.query(reservationCheck_query, [store_id, reservationId], (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            });

            if (results.length > 0) {
                await new Promise((resolve, reject) => {
                    db.query(reservationForVisit_query, reservationId, (err, results) => {
                        if (err) reject(err);
                        resolve(results);
                    });
                });

                const date = results[0].reservation_date.toISOString().split('T')[0];
                return { success: true, reservation_date: date, user_name: results[0].user_name };
            } else {
                return { success: false };
            }
        } catch (err) {
            throw err;
        }
    },

    // 현장 대기 방문 인증
    waitingForVisit: async (store_id, reservationId) => {
        try {
            const results = await new Promise((resolve, reject) => {
                db.query(waitListCheck_query, [store_id, reservationId], (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            });
            
            if (results.length > 0) {
                await new Promise((resolve, reject) => {
                    db.query(waitingForVisit_query, reservationId, (err, results) => {
                        if (err) reject(err);
                        resolve(results);
                    });
                });

                const date = results[0].created_at.toISOString().split('T')[0];
                return { success: true, reservation_date: date, user_name: results[0].user_name };
            } else {
                return { success: false };
            }
            
        } catch (err) {
            throw err;
        }
    },

    // 캘린더 추가
    createCalendar: async (calendarData) => {
        try {
            await new Promise((resolve, reject) => {
                db.query(createCalendar_query, calendarData, (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                })
            })
        } catch (err) {
            throw err;
        }
    },

    // 캘린더 조회
    showCalendar: async (user_name) => {
        try {
            // calendar
            const calendarResults = await new Promise((resolve, reject) => {
                db.query(showCalendar_query, user_name, (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            });
    
            const results = await Promise.all(calendarResults.map(async (entry) => {
                // popup_stores
                const storeResult = await new Promise((resolve, reject) => {
                    db.query(showStore_query, entry.store_id, (err, storeResults) => {
                        if (err) reject(err);
                        resolve(storeResults[0].store_name);
                    });
                });
    
                // images
                const imagesResult = await new Promise((resolve, reject) => {
                    db.query(showImages_query, entry.store_id, (err, imagesResults) => {
                        if (err) reject(err);
                        resolve(imagesResults[0].image_url); // 여러 이미지 결과 반환
                    });
                });
    
                return {
                    ...entry,
                    store_name: storeResult,
                    images: imagesResult
                };
            }));
            return results;
    
        } catch (err) {
            throw err;
        }
    },
}

module.exports = qrCodeModel;