const db = require('../config/mysqlDatabase');

// ------- GET Query -------
const allPopups_query = 'SELECT ps.*, GROUP_CONCAT(i.image_url) AS image_urls FROM popup_stores ps LEFT JOIN images i ON ps.store_id = i.store_id GROUP BY ps.store_id'
const getImagePopup_query = 'SELECT ps.*, i.image_url FROM popup_stores ps LEFT JOIN images i ON ps.store_id = i.store_id WHERE ps.store_id = ?';
const storeReview_query = 'SELECT * FROM store_review WHERE store_id = ?';
const storeReviewDetail_query = 'SELECT * FROM store_review WHERE review_id = ?';
const likePopupSelect_query = 'SELECT * FROM BookMark WHERE user_id = ? AND store_id = ?';
const likePopupCheck_query = 'SELECT store_mark_number FROM popup_stores WHERE store_id = ?';
const adminwait_query = 'SELECT * FROM popup_stores WHERE store_id = ?';
const waitList_query = 'SELECT * FROM wait_list WHERE store_id = ?';
const waitOrder_query = 'SELECT COUNT(*) AS waitOrder FROM wait_list WHERE store_id = ? AND wait_status = "wait" AND wait_reservation_time <= (SELECT wait_reservation_time FROM wait_list WHERE store_id = ? AND user_id = ?)';
const waitReservation_query = 'SELECT store_wait_status FROM popup_stores WHERE store_id = ?';
const getWaitOrder_query = 'SELECT wait_status FROM wait_list WHERE store_id = ? AND user_id = ?';

// ------- POST Query -------
const createReview_query = 'INSERT INTO store_review SET ?';
const createPopup_query = 'INSERT INTO popup_stores SET ?';
const createSchedule_query = 'INSERT INTO store_schedules SET ?';
const likePopupInsert_query = 'INSERT INTO BookMark (user_id, store_id) VALUES (?, ?)';
const createWaitReservation_query = 'INSERT INTO wait_list SET ?';
const createImage_query = 'INSERT INTO images (store_id, image_url) VALUES (?, ?)';

// ------- PUT Query -------
const updatePopup_query = 'UPDATE popup_stores SET ? WHERE store_id = ?';
const updateReview_query = 'UPDATE store_review SET ? WHERE review_id = ?';
const likePopupUpdateMinus_query = 'UPDATE popup_stores SET store_mark_number = store_mark_number - 1 WHERE store_id = ?';
const likePopupUpdatePlus_query = 'UPDATE popup_stores SET store_mark_number = store_mark_number + 1 WHERE store_id = ?';
const updateViewCount_query = 'UPDATE popup_stores SET store_view_count = store_view_count + 1 WHERE store_id = ?';
const updateWaitStatus_query = 'UPDATE popup_stores SET store_wait_status = ? WHERE store_id = ?';
const updateWaitListStatus_query = 'UPDATE wait_list SET wait_status = "completed" WHERE store_id = ? AND user_id = ?';

// ------- DELETE Query -------
const deleteReview_query = 'DELETE FROM store_review WHERE review_id = ?';
const likePopupDelete_query = 'DELETE FROM BookMark WHERE user_id = ? AND store_id = ?';
const adminCompleted_query = 'DELETE FROM wait_list WHERE wait_status ="completed" AND store_id = ?';

const getWaitOrder = (store_id, user_id) => {
    return new Promise((resolve, reject) => {
        db.query(waitOrder_query, [store_id, store_id, user_id], (err, result) => {
            if (err) reject(err);
            else resolve(result[0].waitOrder);
        });
    });
};


const popupModel = { // 모든 팝업 스토어 정보 확인
    allPopups: async () => {
        try {
            const results = await new Promise((resolve, reject) => {
                db.query(allPopups_query, (err, results) => {
                    if (err) reject(err);
                    // 각 image_urls을 배열로 변환
                    results.forEach(result => {
                        if (result.image_urls) {
                            result.imageUrls = result.image_urls.split(',');
                            delete result.image_urls;
                        } else {
                            result.imageUrls = [];
                        }
                    });
                    resolve(results);
                });
            });
            return results;
        } catch (err) {
            throw err;
        }
    },

    createImage: (store_id, imagePath) => {
        return new Promise((resolve, reject) => {
            db.query(createImage_query, [store_id, imagePath], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
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
                        db.query(getImagePopup_query, store_id, (err, popupResult) => {
                            if (err) {
                                reject(err);
                            } else {
                                const popupInfo = { ...popupResult[0] }; // 복사하여 새로운 객체 생성
                                delete popupInfo.image_url; // 이미지 URL 속성 삭제
                                const imageUrls = popupResult.map(row => row.image_url).filter(url => url !== null);
                                popupInfo.imageUrls = imageUrls;
                                resolve(popupInfo);
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
        const tables = ['BookMark', 'products', 'store_review', 'store_schedules', 'wait_list', 'images', 'popup_stores'];
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

    adminWait: async (store_id) => { // 대기 상태 변경
        try {
            const result = await new Promise((resolve, reject) => {
                db.query(adminwait_query, store_id, (err, result) => {
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

            const waitList = await new Promise((resolve, reject) => {
                db.query(waitList_query, store_id, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                })
            })

            if (waitList.length > 0) {
                return { newWaitStatus, waitList };
            } else {
                return '현재 대기 목록이 없습니다.';
            }

        } catch (err) {
            throw err;
        }
    },

    // 예약자 status 변경
    adminWaitAccept: async (user_id, store_id) => {
        try {
            const waitStatus = await new Promise((resolve, reject) => {
                db.query(updateWaitListStatus_query, [store_id, user_id], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                })
            })
            return waitStatus;
        } catch (err) {
            throw err;
        }
    },

    adminCompleted: async (store_id) => {
        try {
            await new Promise((resolve, reject) => {
                db.query(adminCompleted_query, [store_id], (err, result) => {
                    if (err) reject(err);
                    else resolve();
                })
            })
        } catch (err) {
            throw err;
        }
    },

    waitReservation: async (waitReservation) => { // 대기 등록
        try {
            const { store_id, user_id } = waitReservation;

            const waitStatus = await new Promise((resolve, reject) => {
                db.query(waitReservation_query, store_id, (err, result) => {
                    if (err) reject(err);
                    else resolve(result[0].store_wait_status);
                })
            });

            if (waitStatus == 'true') {
                await new Promise((resolve, reject) => {
                    db.query(createWaitReservation_query, waitReservation, (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    })
                });

                const waitOrder = await getWaitOrder(store_id, user_id);

                return waitOrder;
            } else {
                return '지금 바로 입장해주세요';
            }

        } catch (err) {
            throw err;
        }
    },

    getWaitOrder: async (store_id, user_id) => { // 대기 조회
        try {
            const wait_status = await new Promise((resolve, reject) => {
                db.query(getWaitOrder_query, [store_id, user_id], (err, result) => {
                    if (err) reject(err);
                    else resolve(result[0].wait_status);
                })
            });

            if (wait_status == 'wait') {
                const waitOrder = await getWaitOrder(store_id, user_id);
                return waitOrder;
            } else {
                return '지금 바로 입장해주세요';
            }

        } catch (err) {
            throw err;
        }
    },

};

module.exports = popupModel;
