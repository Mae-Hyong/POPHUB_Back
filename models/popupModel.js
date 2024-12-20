const db = require('../config/mysqlDatabase');

// ------- GET Query -------
const allPopups_query = 'SELECT ps.*, GROUP_CONCAT(i.image_url) AS image_urls FROM popup_stores ps LEFT JOIN images i ON ps.store_id = i.store_id WHERE ps.approval_status = "check" AND ps.deleted ="false" GROUP BY ps.store_id';
const getImagePopup_query = 'SELECT ps.*, i.image_url FROM popup_stores ps LEFT JOIN images i ON ps.store_id = i.store_id WHERE ps.store_id = ?';
const storeReview_query = 'SELECT * FROM store_review WHERE store_id = ?';
const storeUserReview_query = 'SELECT * FROM store_review WHERE user_name = ?';
const storeReviewDetail_query = 'SELECT * FROM store_review WHERE review_id = ?';
const likePopupSelect_query = 'SELECT * FROM BookMark WHERE user_name = ? AND store_id = ?';
const likePopupCheck_query = 'SELECT store_mark_number FROM popup_stores WHERE store_id = ?';
const popupExists_query = 'SELECT * FROM popup_stores WHERE store_id = ?';
const waitList_query = 'SELECT * FROM wait_list WHERE store_id = ?';
const waitOrder_query = 'SELECT COUNT(*) AS waitOrder FROM wait_list WHERE store_id = ? AND wait_status = "waiting" AND wait_reservation_time <= (SELECT wait_reservation_time FROM wait_list WHERE store_id = ? AND user_name = ? AND wait_status = "waiting")';
const waitReservation_query = 'SELECT store_wait_status FROM popup_stores WHERE store_id = ?';
const getWaitOrder_query = 'SELECT wait_status FROM wait_list WHERE store_id = ? AND user_name = ?';
const viewDenialReason_query = 'SELECT * FROM popup_denial_logs WHERE store_id = ?';
const userIdSelect_query = 'SELECT user_name FROM user_info WHERE user_name = ?';
const popupStoreUser_query = 'SELECT store_id, store_name FROM popup_stores WHERE user_name = ? AND store_status = "오픈"';
const storeSchedules_query = 'SELECT * FROM store_schedules WHERE store_id = ?';
const bookmark_query = 'SELECT mark_id, user_name, store_id FROM BookMark WHERE user_name = ?';
const checkBookmark_query = 'SELECT * FROM BookMark WHERE store_id = ? AND user_name = ?';
const getpopupByPresident_query = 'SELECT ps.*, GROUP_CONCAT(i.image_url) AS image_urls FROM popup_stores ps LEFT JOIN images i ON ps.store_id = i.store_id WHERE ps.user_name = ? AND ps.deleted = "false" GROUP BY ps.store_id';
const scheduledToOpen_query = 'SELECT ps.*, GROUP_CONCAT(i.image_url) AS imageUrls FROM popup_stores ps LEFT JOIN images i ON ps.store_id = i.store_id WHERE ps.store_start_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 14 DAY) AND ps.approval_status = "check" AND ps.deleted = "false" AND ps.store_status = "오픈 예정" GROUP BY ps.store_id ORDER BY ps.store_start_date ASC';
const scheduledToClose_query = 'SELECT ps.*, GROUP_CONCAT(i.image_url) AS imageUrls FROM popup_stores ps LEFT JOIN images i ON ps.store_id = i.store_id WHERE ps.store_end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND ps.approval_status = "check" AND ps.deleted = "false" AND ps.store_status = "오픈" GROUP BY ps.store_id ORDER BY ps.store_end_date ASC';
const recommendation_query = 'SELECT popup_stores.*, GROUP_CONCAT(images.image_url) AS image_urls FROM popup_stores JOIN images ON popup_stores.store_id = images.store_id WHERE popup_stores.category_id = ? AND popup_stores.deleted = "false" AND (store_status = "오픈" OR store_status = "오픈 예정") GROUP BY popup_stores.store_id ORDER BY RAND() LIMIT 5';
const searchByname_query = 'SELECT * FROM popup_stores WHERE deleted ="false" AND store_name LIKE ? ';
const searchByCategory_query = 'SELECT * FROM popup_stores WHERE deleted = "false" AND category_id = ?';
const image_query = 'SELECT image_url FROM images WHERE store_id = ?';
const getUserImage_query = 'SELECT user_image FROM user_info WHERE user_name = ?';
const checkReview_query = 'SELECT COUNT(*) AS count FROM store_review WHERE store_id = ? AND user_name = ?';
const checkReservation_query = 'SELECT COUNT (*) AS count FROM reservation WHERE store_id = ? AND user_name = ? AND reservation_status = "completed"';

// ------- POST Query -------
const createReview_query = 'INSERT INTO store_review SET ?';
const createPopup_query = 'INSERT INTO popup_stores SET ?';
const createSchedule_query = 'INSERT INTO store_schedules SET ?';
const likePopupInsert_query = 'INSERT INTO BookMark (user_name, store_id) VALUES (?, ?)';
const createWaitReservation_query = 'INSERT INTO wait_list SET ?';
const createImage_query = 'INSERT INTO images (store_id, image_url) VALUES (?, ?)';

// ------- PUT Query -------
const updatePopup_query = 'UPDATE popup_stores SET ? WHERE store_id = ?';
const updateReview_query = 'UPDATE store_review SET ? WHERE review_id = ?';
const likePopupUpdateMinus_query = 'UPDATE popup_stores SET store_mark_number = store_mark_number - 1 WHERE store_id = ?';
const likePopupUpdatePlus_query = 'UPDATE popup_stores SET store_mark_number = store_mark_number + 1 WHERE store_id = ?';
const updateViewCount_query = 'UPDATE popup_stores SET store_view_count = store_view_count + 1 WHERE store_id = ?';
const updateWaitStatus_query = 'UPDATE popup_stores SET store_wait_status = ? WHERE store_id = ?';
const updateWaitListStatus_query = 'UPDATE wait_list SET wait_status = ? WHERE wait_id = ?';

// ------- DELETE Query -------
const deleteImage_query = 'DELETE FROM images WHERE store_id = ?';
const deleteSchedule_query = 'DELETE FROM store_schedules WHERE store_id = ?';
const deleteReview_query = 'DELETE FROM store_review WHERE review_id = ?';
const likePopupDelete_query = 'DELETE FROM BookMark WHERE user_name = ? AND store_id = ?';
const waitDelete_query = 'DELETE FROM wait_list WHERE wait_id = ?';

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
                db.query(allPopups_query, (err, popupResults) => {
                    if (err) return reject(err);
                    if (popupResults.length === 0) return resolve([]);
                    resolve(popupResults);
                });
            });

            if (results.length === 0) {
                return "팝업스토어 정보가 존재하지 않습니다.";
            }

            const schedule = await Promise.all(results.map(async (popup) => {
                const storeSchedules = await new Promise((resolve, reject) => {
                    db.query(storeSchedules_query, [popup.store_id], (err, scheduleResults) => {
                        if (err) return reject(err);
                        resolve(scheduleResults);
                    });
                });

                const schedules = storeSchedules.map(schedule => ({
                    day_of_week: schedule.day_of_week,
                    open_time: schedule.open_time,
                    close_time: schedule.close_time
                }));

                popup.store_schedules = schedules;
                popup.imageUrls = popup.image_urls ? popup.image_urls.split(',') : [];
                delete popup.image_urls;
                return popup;
            }));

            return schedule;
        } catch (err) {
            throw err;
        }
    },

    // 팝업 등록자별 조회
    popupByPresident: async (user_name) => {
        try {
            const results = await new Promise((resolve, reject) => {
                db.query(getpopupByPresident_query, user_name, async (err, result) => {
                    if (err) reject(err);
                    if (!result || result.length === 0) {
                        resolve("현재 등록된 팝업이 없습니다. 팝업을 등록해주세요!");
                    } else {
                        for (const popup of result) {
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
                        resolve(result);
                    }
                });
            });
            return results;
        } catch (err) {
            throw err;
        }
    },

    // 오픈 예정 팝업 조회
    scheduledToOpen: async () => {
        try {
            const popupResults = await new Promise((resolve, reject) => {
                db.query(scheduledToOpen_query, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });

            if (popupResults.length === 0) {
                return "2주 안으로 오픈 예정 팝업스토어가 없습니다.";
            }

            const result = popupResults.map(popup => {
                return {
                    ...popup,
                    imageUrls: popup.imageUrls ? popup.imageUrls.split(',') : []
                };
            });

            return result;
        } catch (err) {
            throw err;
        }
    },

    // 마감 임박 팝업 조회
    scheduledToClose: async () => {
        try {
            const popupResults = await new Promise((resolve, reject) => {
                db.query(scheduledToClose_query, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });

            if (popupResults.length === 0) {
                return "일주일 안으로 마감 예정 팝업스토어가 없습니다.";
            }

            const result = popupResults.map(popup => {
                return {
                    ...popup,
                    imageUrls: popup.imageUrls ? popup.imageUrls.split(',') : []
                };
            });

            return result;
        } catch (err) {
            throw err;
        }
    },

    // 검색어로 스토어 이름 검색
    searchStoreName: async (store_name) => {
        try {
            const name = await new Promise((resolve, reject) => {
                db.query(searchByname_query, `%${store_name}%`, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });

            if (name.length === 0) {
                return { message: '검색 결과가 없습니다.' };
            }

            const result = await Promise.all(name.map(async (popup) => {

                const images = await new Promise((resolve, reject) => {
                    db.query(image_query, popup.store_id, (err, images) => {
                        if (err) reject(err);
                        else resolve(images.map(image => image.image_url));
                    });
                });
                return {
                    ...popup,
                    images
                };
            }));

            return result;
        } catch (err) {
            throw err;
        }
    },

    // 카테고리로 팝업 검색
    searchCategory: async (category_id) => {
        try {
            const category = await new Promise((resolve, reject) => {
                db.query(searchByCategory_query, category_id, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                })
            })

            if (category.length === 0) {
                return { message: '해당 카테고리의 팝업이 존재하지 않습니다.' };
            }
            const results = await Promise.all(category.map(async (store) => {
                const images = await new Promise((resolve, reject) => {
                    db.query(image_query, store.store_id, (err, images) => {
                        if (err) reject(err);
                        else resolve(images.map(image => image.image_url));
                    });
                });
                return {
                    ...store,
                    images
                };
            }));

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

        // 조회수
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

            if (user_name) { // user_name이 있는 경우
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
        const tables = ['BookMark', 'store_review'];
        try {

            const product_ids = await new Promise((resolve, reject) => {
                db.query('SELECT product_id FROM products WHERE store_id = ?', store_id, (err, results) => {
                    if (err) reject(err);
                    else resolve(results.map(result => result.product_id));
                });
            });

            for (const product_id of product_ids) {
                await new Promise((resolve, reject) => {
                    db.query('DELETE FROM BookMark WHERE product_id = ?', product_id, (err, result) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            };


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

                await new Promise((resolve, reject) => {
                    db.query('UPDATE popup_stores SET deleted = "true" WHERE store_id = ?', store_id, (err, result) => {
                        if (err) reject(err);
                        else resolve();
                    })
                })
            }
            return true;
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
    likeUser: async (user_name) => {
        try {
            const bookmark = await new Promise((resolve, reject) => {
                db.query(bookmark_query, user_name, (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                })
            })

            if (bookmark.length > 0) {
                return bookmark;
            } else {
                return { message: '찜 내역이 존재하지 않습니다.' };
            }
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
                return "현재 작성된 리뷰가 없습니다.";
            }

            const reviewData = await Promise.all(results.map(async (review) => {
                const userImage = await new Promise((resolve, reject) => {
                    db.query(getUserImage_query, [review.user_name], (err, user) => {
                        if (err) reject(err);
                        resolve(user[0]?.user_image || null);
                    });
                });

                return {
                    ...review,
                    user_image: userImage
                };
            }));

            return reviewData;
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

            const reviewData = await Promise.all(results.map(async (review) => {
                const userImage = await new Promise((resolve, reject) => {
                    db.query(getUserImage_query, [review.user_name], (err, user) => {
                        if (err) reject(err);
                        resolve(user[0]?.user_image || null);
                    });
                });

                return {
                    ...review,
                    user_image: userImage
                };
            }));

            return reviewData;
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

    // 리뷰 중복 체크
    checkReview: async (store_id, user_name) => {
        try {
            const result = await new Promise((resolve, reject) => {
                db.query(checkReview_query, [store_id, user_name], (err, result) => {
                    if (err) reject(err);
                    else resolve(result[0].count > 0);
                });
            });

            return result;
        } catch (err) {
            throw err;
        }
    },

    // 리뷰 권한 체크
    checkReservation: async (store_id, user_name) => {
        try {
            const waitListCheck_query = 'SELECT COUNT(*) AS count FROM wait_list WHERE store_id = ? AND user_name = ? AND status = "completed"';
            const reservationResult = await new Promise((resolve, reject) => {
                db.query(checkReservation_query, [store_id, user_name], (err, result) => {
                    if (err) reject(err);
                    else resolve(result[0].count > 0);
                });
            });

            const waitListResult = await new Promise((resolve, reject) => {
                db.query(waitListCheck_query, [store_id, user_name], (err, result) => {
                    if (err) reject(err);
                    else resolve(result[0].count > 0);
                });
            });

            if (reservationResult || waitListResult) {
                return { success: true };
            } else {
                return { success: false };
            }

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
                db.query(popupExists_query, store_id, (err, result) => {
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

    // 추천 시스템
    recommendationData: async (recommendedCategory, recommendedCategories, gender, age) => {
        try {
            const getCategoryData = async (category) => {
                return new Promise((resolve, reject) => {
                    db.query(recommendation_query, [category], (err, result) => {
                        if (err) reject(err);
                        else {
                            try {
                                for (const popup of result) {
                                    if (popup.image_urls) {
                                        popup.imageUrls = popup.image_urls.split(',');
                                        delete popup.image_urls;
                                    } else {
                                        popup.imageUrls = [];
                                    }
                                }
                                resolve(result);
                            } catch (err) {
                                reject(err);
                            }
                        }
                    });
                });
            };

            // 해당 카테고리 값 출력
            const firstCategoryData = await getCategoryData(recommendedCategory);

            let results = firstCategoryData.slice(0, 4);

            // 다른 카테고리 추가 선택
            if (recommendedCategories.length > 0) {
                let otherData = [];

                for (const category of recommendedCategories) {
                    const categoryData = await getCategoryData(category);
                    if (categoryData.length > 0) {
                        otherData = otherData.concat(categoryData);
                    }
                }

                const addData = otherData.sort(() => 0.5 - Math.random()).slice(0, 2);

                results = results.concat(addData);
            }
            
            // result의 결과 값이 6개 미만일 경우
            if (results.length < 6) {

                // 성별 및 나이에 따른 카테고리 분리
                const pickCategoriesByGenderAndAge = (gender, age) => {
                    if (gender === 'F') {
                        if (age < 22) return [32, 30, 15];
                        if (age < 33) return [11, 12, 18];
                        if (age < 40) return [17, 22, 25];
                        return [33, 29, 22];
                    } else {
                        if (age < 22) return [27, 30, 32];
                        if (age < 30) return [10, 23, 28];
                        if (age < 40) return [10, 16, 17];
                        return [29, 33, 22];
                    }
                };
            
                const pickCategories = pickCategoriesByGenderAndAge(gender, age);
                const categoriesToAdd = pickCategories.filter(cat => !results.some(item => item.category_id === cat));

                let pickData = [];
                for (const category of categoriesToAdd) {
                    const categoryData = await getCategoryData(category);
                    if (categoryData.length > 0) {
                        pickData = pickData.concat(categoryData);
                    }
                }

                const addPickData = pickData.filter(dataItem => !results.some(resultItem => resultItem.category_id === dataItem.category_id))
                    .sort(() => 0.5 - Math.random()).slice(0, 6 - results.length);

                results = results.concat(addPickData);
            }

            return results.length > 0 ? results : '해당 카테고리의 팝업이 존재하지 않습니다.';
        } catch (err) {
            throw err;
        }
    },
};

module.exports = popupModel;
