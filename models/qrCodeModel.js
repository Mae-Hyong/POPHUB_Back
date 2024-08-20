const db = require('../config/mysqlDatabase');

// ------- GET Query -------
const popupExists_query = 'SELECT * FROM popup_stores WHERE store_id = ?';
const qrCodeExistsQuery = 'SELECT * FROM qrcodes WHERE store_id = ?';
const scanQrCode_query = 'SELECT * FROM qrcodes WHERE qrcode_url = ?';
const reservationForVisit_query = 'UPDATE reservation SET reservation_status = "completed" WHERE reservation_id = ? AND store_id = ?';
const waitingForVisit_query = 'UPDATE wait_list SET status = "completed" WHERE reservation_id = ? AND store_id = ?';

// ------- POST Query -------
const insertQrCode_query = 'INSERT INTO qrcodes SET ?';

// ------- PUT Query -------

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
    reservationForVisit: async (reservation_id, store_id) => {
        try {
            await new Promise((resolve, reject) => {
                db.query(reservationForVisit_query, [reservation_id, store_id], (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            });

            return { success: true };
        } catch (err) {
            throw err;
        }
    },

    // 현장 대기 방문 인증
    waitingForVisit: async (reservation_id, store_id) => {
        try {
            await new Promise((resolve, reject) => {
                db.query(waitingForVisit_query, [reservation_id, store_id], (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            });

            return { success: true };
        } catch (err) {
            throw err;
        }
    },
}

module.exports = qrCodeModel;