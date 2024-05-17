const db = require('../config/mysqlDatabase');

// ------- GET Query -------
const allPopups_query = 'SELECT ps.*, GROUP_CONCAT(i.image_url) AS image_urls FROM popup_stores ps LEFT JOIN images i ON ps.store_id = i.store_id WHERE ps.approval_status = "check" AND ps.store_status = "오픈" GROUP BY ps.store_id';
const popularPopups_query = 'SELECT ps.*, GROUP_CONCAT(i.image_url) AS image_urls FROM popup_stores ps LEFT JOIN images i ON ps.store_id = i.store_id WHERE ps.store_status = "오픈" GROUP BY ps.store_id ORDER BY ps.store_view_count DESC LIMIT 3';
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
const pending_query = 'SELECT * FROM popup_stores WHERE approval_status = "pending"';
const viewDenialReason_query = 'SELECT * FROM popup_denial_logs WHERE store_id = ?';

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
const pendingCheck_query = 'UPDATE popup_stores SET approval_status = "check" WHERE store_id = ?';
const pendingDeny_query = 'UPDATE popup_stores SET approval_status = "deny" WHERE store_id = ?';

// ------- DELETE Query -------
const deleteImage_query = 'DELETE FROM images WHERE store_id = ?';
const deleteSchedule_query = 'DELETE FROM store_schedules WHERE store_id = ?';
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


const popupModel = {
    // 오픈 중인 모든 팝업스토어 정보 확인
    allPopups: async () => {
        try {
            const results = await new Promise((resolve, reject) => {
                db.query(allPopups_query, (err, results) => {
                    if (err) reject(err);
                    if (!results || results.length === 0) {
                        resolve("팝업스토어 정보가 존재하지 않습니다.");
                    } else {
                        results.forEach(result => {
                            if (result.image_urls) {
                                result.imageUrls = result.image_urls.split(',');
                                delete result.image_urls;
                            } else {
                                result.imageUrls = [];
                            }
                        });
                        resolve(results);
                    }
                });
            });
            return results;
        } catch (err) {
            throw err;
        }
    },

    // 오픈 중인 팝업스토어 중 조회수 기준 3개 추출
    popularPopups: async () => {
        try {
            const results = await new Promise((resolve, reject) => {
                db.query(popularPopups_query, (err, results) => {
                    if (err) reject(err);
                    if (!results || results.length === 0) {
                        resolve("인기 팝업이 존재하지 않습니다.");
                    } else {
                        results.forEach(result => {
                            if (result.image_urls) {
                                result.imageUrls = result.image_urls.split(',');
                                delete result.image_urls;
                            } else {
                                result.imageUrls = [];
                            }
                        });
                        resolve(results);
                    }
                });
            });
            return results;
        } catch (err) {
            throw err;
        }
    },

    // 이미지 업로드
    uploadImage: async (store_id, imagePath) => {
        try {
            await db.query(deleteImage_query, [store_id]);
            const result = await new Promise((resolve, reject) => {
                db.query(createImage_query, [store_id, imagePath], (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
            return result;
        } catch (err) {
            throw err;
        }
    },

    // 팝업스토어 등록
    createPopup: async (popupData) => {
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

    // 스케줄 등록
    uploadSchedule: async (store_id, popupSchedule) => {
        try {
            await db.query(deleteSchedule_query, [store_id]);
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

    // 하나의 팝업 정보 조회
    getPopup: async (store_id) => {
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

    // 팝업 정보 수정
    updatePopup: async (store_id, updateData) => {
        try {
            updateData.approval_status = 'pending';

            await new Promise((resolve, reject) => {
                db.query(updatePopup_query, [updateData, store_id], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            return updateData;
        } catch (err) {
            throw err;
        }
    },

    // 팝업 정보 삭제
    deletePopup: async (store_id) => {
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

    // 관리자 pending List 출력
    adminPendingList: async (user_id) => {
        try {
            const pendingList = await new Promise((resolve, reject) => {
                db.query(pending_query, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
            return pendingList;
        } catch (err) {
            throw err;
        }
    },

    // 관리자 승인
    adminPendingCheck: async (store_id) => {
        try {
            await new Promise((resolve, reject) => {
                db.query(pendingCheck_query, [store_id], (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
        } catch (err) {
            throw err;
        }
    },

    // 관리자 거부 및 거부 사유 등록
    adminPendingDeny: async (denyData) => {
        try {
            
            await new Promise((resolve, reject) => {
                db.query(pendingDeny_query, [denyData.store_id], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });

            const insertDeny_query = 'INSERT INTO popup_denial_logs SET ?';
            await new Promise((resolve, reject) => {
                db.query(insertDeny_query, denyData, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
        } catch (err) {
            throw err;
        }
    },

    // 거부 사유 확인
    viewDenialReason: async (store_id) => {
        try {
            const check = await new Promise((resolve, reject) => {
                db.query(viewDenialReason_query, store_id, (err, result) => {
                    if (err) reject (err);
                    else resolve(result);
                })
            })
            return check;
        } catch (err) {
            throw err;
        }
    },

    // 팝업 북마크
    likePopup: async (user_id, store_id) => {
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
