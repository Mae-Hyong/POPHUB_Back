const db = require('../config/mysqlDatabase');

// ------- GET Query -------
const allPopups_query = 'SELECT ps.*, GROUP_CONCAT(i.image_url) AS image_urls FROM popup_stores ps LEFT JOIN images i ON ps.store_id = i.store_id WHERE ps.approval_status = "check" AND ps.deleted ="false" GROUP BY ps.store_id';
const popularPopups_query = 'SELECT ps.*, GROUP_CONCAT(i.image_url) AS image_urls FROM popup_stores ps LEFT JOIN images i ON ps.store_id = i.store_id WHERE ps.store_status = "오픈" GROUP BY ps.store_id ORDER BY ps.store_view_count DESC LIMIT 3';
const getImagePopup_query = 'SELECT ps.*, i.image_url FROM popup_stores ps LEFT JOIN images i ON ps.store_id = i.store_id WHERE ps.store_id = ?';
const storeReview_query = 'SELECT * FROM store_review WHERE store_id = ?';
const storeUserReview_query = 'SELECT * FROM store_review WHERE user_name = ?';
const storeReviewDetail_query = 'SELECT * FROM store_review WHERE review_id = ?';
const likePopupSelect_query = 'SELECT * FROM BookMark WHERE user_name = ? AND store_id = ?';
const likePopupCheck_query = 'SELECT store_mark_number FROM popup_stores WHERE store_id = ?';
const adminwait_query = 'SELECT * FROM popup_stores WHERE store_id = ?';
const waitList_query = 'SELECT * FROM wait_list WHERE store_id = ?';
const waitOrder_query = 'SELECT COUNT(*) AS waitOrder FROM wait_list WHERE store_id = ? AND wait_status = "waiting" AND wait_reservation_time <= (SELECT wait_reservation_time FROM wait_list WHERE store_id = ? AND user_name = ? AND wait_status = "waiting")';
const waitReservation_query = 'SELECT store_wait_status FROM popup_stores WHERE store_id = ?';
const getWaitOrder_query = 'SELECT wait_status FROM wait_list WHERE store_id = ? AND user_name = ?';
const viewDenialReason_query = 'SELECT * FROM popup_denial_logs WHERE store_id = ?';
const userIdSelect_query = 'SELECT user_name FROM user_info WHERE user_name = ?';
const popupStoreUser_query = 'SELECT store_id, store_name FROM popup_stores WHERE user_name = ? AND store_status = "오픈"';
const storeSchedules_query = 'SELECT * FROM store_schedules WHERE store_id = ?';
const checkCapacity_query = 'SELECT max_capacity, current_capacity FROM store_capacity WHERE store_id = ? AND reservation_date = ? AND reservation_time = ?';
const maxCapacity_query = 'SELECT max_capacity FROM popup_stores WHERE store_id = ?';
const getReservationUser_query = 'SELECT * FROM reservation WHERE user_name = ?';
const getReservationPresident_query = 'SELECT * FROM reservation WHERE store_id = ?';
const getcapacityByReservationId_query = 'SELECT * FROM reservation WHERE reservation_id = ?';
const bookmark_query = 'SELECT mark_id, user_name, store_id FROM BookMark WHERE user_name = ?';
const checkBookmark_query = 'SELECT * FROM BookMark WHERE store_id = ? AND user_name = ?';

// ------- POST Query -------
const createReview_query = 'INSERT INTO store_review SET ?';
const createPopup_query = 'INSERT INTO popup_stores SET ?';
const createSchedule_query = 'INSERT INTO store_schedules SET ?';
const likePopupInsert_query = 'INSERT INTO BookMark (user_name, store_id) VALUES (?, ?)';
const createWaitReservation_query = 'INSERT INTO wait_list SET ?';
const createImage_query = 'INSERT INTO images (store_id, image_url) VALUES (?, ?)';
const reservation_query = 'INSERT INTO reservation SET ?';
const storeCapacity_query = 'INSERT INTO store_capacity SET ?';

// ------- PUT Query -------
const updatePopup_query = 'UPDATE popup_stores SET ? WHERE store_id = ?';
const updateReview_query = 'UPDATE store_review SET ? WHERE review_id = ?';
const likePopupUpdateMinus_query = 'UPDATE popup_stores SET store_mark_number = store_mark_number - 1 WHERE store_id = ?';
const likePopupUpdatePlus_query = 'UPDATE popup_stores SET store_mark_number = store_mark_number + 1 WHERE store_id = ?';
const updateViewCount_query = 'UPDATE popup_stores SET store_view_count = store_view_count + 1 WHERE store_id = ?';
const updateWaitStatus_query = 'UPDATE popup_stores SET store_wait_status = ? WHERE store_id = ?';
const updateWaitListStatus_query = 'UPDATE wait_list SET wait_status = ? WHERE wait_id = ?';
const updateCapacity_query = 'UPDATE store_capacity SET current_capacity = ? WHERE store_id = ? AND reservation_date = ? AND reservation_time = ?';
const updateCapacityMinus_query = 'UPDATE store_capacity SET current_capacity = current_capacity - ? WHERE store_id = ? AND reservation_date = ? AND reservation_time = ?';
// ------- DELETE Query -------
const deleteImage_query = 'DELETE FROM images WHERE store_id = ?';
const deleteSchedule_query = 'DELETE FROM store_schedules WHERE store_id = ?';
const deleteReview_query = 'DELETE FROM store_review WHERE review_id = ?';
const likePopupDelete_query = 'DELETE FROM BookMark WHERE user_name = ? AND store_id = ?';
const waitDelete_query = 'DELETE FROM wait_list WHERE wait_id = ?';
const deleteReservation_query = 'DELETE FROM reservation WHERE reservation_id = ?';

const getWaitOrder = (store_id, user_name) => {
    return new Promise((resolve, reject) => {
        db.query(waitOrder_query, [store_id, store_id, user_name], (err, result) => {
            if (err) reject(err);
            else resolve(result[0].waitOrder);
        });
    });
};

const popupModel = {
    allPopups: async () => {
        try {
            const results = await new Promise((resolve, reject) => {
                db.query(allPopups_query, async (err, popupResults) => {
                    if (err) reject(err);
                    if (!popupResults || popupResults.length === 0) {
                        resolve("팝업스토어 정보가 존재하지 않습니다.");
                    } else {
                        for (const popup of popupResults) {
                            const storeSchedules = await new Promise((resolve, reject) => {
                                db.query(storeSchedules_query, [popup.store_id], (err, scheduleResults) => {
                                    if (err) reject(err);
                                    resolve(scheduleResults);
                                });
                            });

                            const schedules = storeSchedules.map(schedule => ({
                                day_of_week: schedule.day_of_week,
                                open_time: schedule.open_time,
                                close_time: schedule.close_time
                            }));

                            popup.store_schedules = schedules;

                            if (popup.image_urls) {
                                popup.imageUrls = popup.image_urls.split(',');
                                delete popup.image_urls;
                            } else {
                                popup.imageUrls = [];
                            }
                        }
                        resolve(popupResults);
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
                db.query(popularPopups_query, async (err, popupResults) => {
                    if (err) reject(err);
                    if (!popupResults || popupResults.length === 0) {
                        resolve("인기 팝업이 존재하지 않습니다.");
                    } else {
                        for (const popup of popupResults) {
                            try {
                                const storeSchedules = await new Promise((resolve, reject) => {
                                    db.query(storeSchedules_query, [popup.store_id], (err, scheduleResults) => {
                                        if (err) reject(err);
                                        resolve(scheduleResults);
                                    });
                                });

                                const schedules = storeSchedules.map(schedule => ({
                                    day_of_week: schedule.day_of_week,
                                    open_time: schedule.open_time,
                                    close_time: schedule.close_time
                                }));

                                popup.store_schedules = schedules;

                                if (popup.image_urls) {
                                    popup.imageUrls = popup.image_urls.split(',');
                                    delete popup.image_urls;
                                } else {
                                    popup.imageUrls = [];
                                }
                            } catch (err) {
                                reject(err);
                                return;
                            }
                        }
                        resolve(popupResults);
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
                    if (err) reject(err);
                    else resolve(result);
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
    getPopup: async (store_id, user_name) => {
        // 조회수를 업데이트하는 함수
        const updateViewCount = (store_id) => {
            return new Promise((resolve, reject) => {
                db.query(updateViewCount_query, store_id, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
        };
    
        // 팝업 정보
        const getPopupInfo = (store_id) => {
            return new Promise((resolve, reject) => {
                db.query(getImagePopup_query, store_id, (err, result) => {
                    if (err) reject(err);
                    else {
                        const popupInfo = { ...result[0] };
                        delete popupInfo.image_url;
                        popupInfo.imageUrls = result.map(row => row.image_url).filter(url => url !== null);
                        resolve(popupInfo);
                    }
                });
            });
        };
    
        // 스케줄
        const getStoreSchedules = (store_id) => {
            return new Promise((resolve, reject) => {
                db.query(storeSchedules_query, [store_id], (err, result) => {
                    if (err) reject(err);
                    else {
                        const schedules = result.map(schedule => ({
                            day_of_week: schedule.day_of_week,
                            open_time: schedule.open_time,
                            close_time: schedule.close_time
                        }));
                        resolve(schedules);
                    }
                });
            });
        };

        const checkBookmark = (store_id, user_name) => {
            return new Promise((resolve, reject) => {
                db.query(checkBookmark_query, [store_id, user_name], (err, result) => {
                    if (err) reject(err);
                    else resolve(result.length > 0);
                });
            });
        };
    
        try {
            await updateViewCount(store_id);
            const popupInfo = await getPopupInfo(store_id);
            const storeSchedules = await getStoreSchedules(store_id);
            
            popupInfo.store_schedules = storeSchedules;

            if(user_name) { // user_name이 있는 경우
                popupInfo.is_bookmarked = await checkBookmark(store_id, user_name);
            } else {
                popupInfo.is_bookmarked = false;
            }
    
            return popupInfo;
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
        //const tables = ['BookMark', 'products', 'store_review', 'store_schedules', 'wait_list', 'images', 'payment_details', 'popup_stores'];
        // try {
        //     for (const tableName of tables) { // 해당 테이블에 store_id값 확인
        //         const yes = await new Promise((resolve, reject) => {
        //             db.query(`SELECT COUNT(*) AS count FROM ${tableName} WHERE store_id = ?`, [store_id], (err, result) => {
        //                 if (err) reject(err);
        //                 else resolve(result[0].count > 0); // 값 존재 여부 반환
        //             });
        //         });

        //         if (yes) {
        //             await new Promise((resolve, reject) => {
        //                 db.query(`DELETE FROM ${tableName} WHERE store_id = ?`, [store_id], (err, result) => {
        //                     if (err) reject(err);
        //                     else resolve();
        //                 });
        //             });
        //         }
        //     }
        //     return true;
        try {
            await new Promise((resolve, reject) => {
                db.query('UPDATE popup_stores SET deleted = "true" WHERE store_id = ?', store_id, (err, result) => {
                    if (err) reject(err);
                    else resolve();
                })
            })
        } catch (err) {
            throw err;
        }
    },

    // 거부 사유 확인
    viewDenialReason: async (store_id) => {
        try {
            const check = await new Promise((resolve, reject) => {
                db.query(viewDenialReason_query, store_id, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                })
            })
            return check;
        } catch (err) {
            throw err;
        }
    },

    // 팝업 북마크
    likePopup: async (user_name, store_id) => {
        try {
            const bookmarks = await new Promise((resolve, reject) => {
                db.query(likePopupSelect_query, [user_name, store_id], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            if (bookmarks.length > 0) {
                await new Promise((resolve, reject) => {
                    db.query(likePopupDelete_query, [user_name, store_id], (err, results) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                await new Promise((resolve, reject) => {
                    db.query(likePopupUpdateMinus_query, store_id, (err, results) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            } else {
                await new Promise((resolve, reject) => {
                    db.query(likePopupInsert_query, [user_name, store_id], (err, results) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                await new Promise((resolve, reject) => {
                    db.query(likePopupUpdatePlus_query, store_id, (err, results) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            }

            const store_mark_number = await new Promise((resolve, reject) => {
                db.query(likePopupCheck_query, store_id, (err, results) => {
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

    // 팝업 찜 조회
    likeUser: async(user_name) => {
        try {
            const bookmark = await new Promise((resolve, reject) => {
                db.query(bookmark_query, user_name, (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                })
            })
            return bookmark;
        } catch (err) {
            throw err;
        }
    },

    // 특정 팝업 스토어 리뷰
    storeReview: async (store_id) => {
        try {
            const results = await new Promise((resolve, reject) => {
                db.query(storeReview_query, store_id, (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            });

            if (results.length === 0) {
                return "현재 작성된 리뷰가 없습니다. 예약 후 작성해보세요!";
            }

            return results;
        } catch (err) {
            throw err;
        }
    },

    // 아이디별 팝업 스토어 리뷰
    storeUserReview: async (user_name) => {
        try {
            const results = await new Promise((resolve, reject) => {
                db.query(storeUserReview_query, user_name, (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            });

            if (results.length === 0) {
                return "현재 작성된 리뷰가 없습니다. 예약 후 작성해보세요!";
            }

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

    // 대기 등록
    waitReservation: async (waitReservation) => {
        try {
            const { store_id, user_name } = waitReservation;

            const waitStatus = await new Promise((resolve, reject) => { // 현재 팝업스토어 대기 상태 파악
                db.query(waitReservation_query, store_id, (err, result) => {
                    if (err) reject(err);
                    else resolve(result[0].store_wait_status);
                })
            });

            waitReservation.wait_status = waitStatus === 'true' ? 'waiting' : 'queued';

            await new Promise((resolve, reject) => {
                db.query(createWaitReservation_query, waitReservation, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                })
            });

            if (waitReservation.wait_status == 'waiting') {
                const waitOrder = await getWaitOrder(store_id, user_name); // 대기 순번 반환
                return waitOrder;
            } else {
                return '지금 바로 입장해주세요';
            }

        } catch (err) {
            throw err;
        }
    },

    // 예약자 대기 순서 조회
    getWaitOrder: async (store_id, user_name) => {
        try {
            const wait_status = await new Promise((resolve, reject) => {
                db.query(getWaitOrder_query, [store_id, user_name], (err, result) => {
                    if (err) reject(err);
                    else resolve(result[0].wait_status);
                })
            });

            if (wait_status == 'waiting') {
                const waitOrder = await getWaitOrder(store_id, user_name);
                return waitOrder;
            } else if (wait_status == 'queued') {
                return '지금 바로 입장해주세요';
            } else if (wait_status == 'entered') {
                return '입장이 완료되었습니다.';
            } else if (wait_status == 'skipped') {
                return '대기 순서가 지났습니다. 다시 예약해주세요.';
            }

        } catch (err) {
            throw err;
        }
    },

    // 해당 관리자 waitList 확인
    adminWaitList: async (user_name) => {
        try {
            const userInfoResult = await new Promise((resolve, reject) => {
                db.query(userIdSelect_query, [user_name], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            const userName = userInfoResult[0].user_name;

            const popupStoreResult = await new Promise((resolve, reject) => {
                db.query(popupStoreUser_query, userName, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });

            const stores = popupStoreResult.map(store => ({
                store_id: store.store_id,
                store_name: store.store_name
            }));

            const waitListPromises = stores.map(store =>
                new Promise((resolve, reject) => {
                    db.query(waitList_query, store.store_id, (err, result) => {
                        if (err) reject(err);
                        else resolve({
                            store_id: store.store_id,
                            store_name: store.store_name,
                            waitList: result
                        });
                    });
                })
            );

            const waitList = await Promise.all(waitListPromises);
            const waitListEmpty = waitList.every(store => store.waitList.length === 0);
            if (waitListEmpty) {
                return '현재 대기 목록이 없습니다.';
            } else {
                return waitList;
            }
        } catch (err) {
            throw err;
        }
    },


    // 팝업 관리자 팝업 대기 상태 변경 (오픈 중인 스토어에 대해서만)
    popupStatus: async (store_id) => {
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

            return newWaitStatus;

        } catch (err) {
            throw err;
        }
    },


    // 예약자 status 변경
    waitStatus: async (wait_id, new_status) => {
        try {
            await new Promise((resolve, reject) => {
                db.query(updateWaitListStatus_query, [new_status, wait_id], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
        } catch (err) {
            throw err;
        }
    },

    // 예약자 삭제
    waitDelete: async (wait_id) => {
        try {
            await new Promise((resolve, reject) => {
                db.query(waitDelete_query, wait_id, (err, result) => {
                    if (err) reject(err);
                    else resolve();
                })
            })
        } catch (err) {
            throw err;
        }
    },

    // 예약
    reservation: async (reservationData) => {
        try {
            const { store_id, reservation_date, reservation_time, capacity } = reservationData;
            const check = await new Promise((resolve, reject) => { // store_capacity에 값이 있는지 확인
                db.query(checkCapacity_query, [store_id, reservation_date, reservation_time], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                })
            })

            const popup_capacity = await new Promise((resolve, reject) => {
                db.query(maxCapacity_query, store_id, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });

            const current_capacity = check.length > 0 ? check[0].current_capacity : 0;
            const max_capacity = popup_capacity[0].max_capacity;
            const update_capacity = current_capacity + reservationData.capacity;

            if (update_capacity <= max_capacity) {

                await new Promise((resolve, reject) => {
                    db.query(reservation_query, reservationData, (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });
                
                if (check.length === 0) { // store_capacity에 값이 없는 경우,
                    const capacityData = {
                        store_id,
                        reservation_date,
                        reservation_time,
                        max_capacity,
                        current_capacity: capacity
                    };

                    await new Promise((resolve, reject) => {
                        db.query(storeCapacity_query, capacityData, (err, result) => {
                            if (err) reject(err);
                            else resolve(result);
                        });
                    });

                } else {
                    await new Promise((resolve, reject) => {
                        db.query(updateCapacity_query, [update_capacity, store_id, reservation_date, reservation_time], (err, result) => {
                            if (err) reject(err);
                            else resolve(result);
                        });
                    });
                };
                return { success: true, update_capacity, max_capacity };
            } else {
                return { success: false, update_capacity, max_capacity };
            }

        } catch (err) {
            throw err;
        }
    },

    getReservationUser: async (user_name) => {
        const results = await new Promise((resolve, reject) => {
            db.query(getReservationUser_query, user_name, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        return results;
    },

    getReservationPresident: async (store_id) => {
        const results = await new Promise((resolve, reject) => {
            db.query(getReservationPresident_query, store_id, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        return results;
    },

    deleteReservation: async (reservation_id) => {
        const getCapacity = await new Promise((resolve, reject) => {
            db.query(getcapacityByReservationId_query, reservation_id, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        const { store_id, reservation_date, reservation_time, capacity } = getCapacity[0];
        console.log(store_id);
        console.log(capacity);

        await new Promise((resolve, reject) => {
            db.query(updateCapacityMinus_query, [capacity, store_id, reservation_date, reservation_time], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        await new Promise((resolve, reject) => {
            db.query(deleteReservation_query, reservation_id, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            })
        })
    },

};

module.exports = popupModel;
