const db = require("../config/mysqlDatabase");
const admin = require("firebase-admin");
const firestore = admin.firestore();

// ------- GET Query -------

const pending_query =
    'SELECT ps.*, GROUP_CONCAT(i.image_url) AS image_urls FROM popup_stores ps LEFT JOIN images i ON ps.store_id = i.store_id WHERE ps.approval_status = "pending" AND deleted = "false" GROUP BY ps.store_id';
const search_category_query = "SELECT * FROM category";
const select_category_query =
    "SELECT category_name FROM category WHERE category_id = ?";
const search_notice_query = "SELECT * FROM notice";
const select_notice_query = "SELECT * FROM notice WHERE notice_id = ?";
const search_event_query = "SELECT * FROM events ORDER BY created_at DESC";
const select_event_query = "SELECT * FROM events WHERE event_id = ?";
const search_achieve_query = "SELECT * FROM achieve";
const select_achieve_query = "SELECT * FROM achieve WHERE achieve_id = ?";
const search_inquiry_query = "SELECT * FROM inquiry";
// ------- POST Query -------
const create_answer_query =
    "INSERT INTO answer(inquiry_id, user_name, content) VALUES (?, ?, ?)";
const create_notice_query = "INSERT INTO notice SET ?";
const create_event_query = "INSERT INTO event SET ?";
// ------- PUT Query -------
const update_inquiry_query =
    "UPDATE inquiry SET status = ? WHERE inquiry_id = ?";
const pendingCheck_query =
    'UPDATE popup_stores SET approval_status = "check" WHERE store_id = ?';
const pendingDeny_query =
    'UPDATE popup_stores SET approval_status = "deny" WHERE store_id = ?';
const userName_query = "SELECT user_name FROM popup_stores WHERE store_id = ?";
const insertDeny_query = "INSERT INTO popup_denial_logs SET ?";
const get_all_users_query = "SELECT user_name, fcm_token FROM users"; // 모든 사용자 정보 가져오기

const adminModel = {
    selectCategory: (categoryId) => {
        return new Promise((resolve, reject) => {
            db.query(select_category_query, categoryId, (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            });
        });
    },

    searchCategory: () => {
        return new Promise((resolve, reject) => {
            db.query(search_category_query, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },

    createAnswer: (inquiryId, user_name, content) => {
        return new Promise((resolve, reject) => {
            db.query(
                create_answer_query,
                [inquiryId, user_name, content],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result[0]);
                }
            );
        });
    },

    updateInquiry: (inquiryId) => {
        return new Promise((resolve, reject) => {
            db.query(
                update_inquiry_query,
                ["complete", inquiryId],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result[0]);
                }
            );
        });
    },

    searchInquiry: () => {
        return new Promise((resolve, reject) => {
            db.query(search_inquiry_query, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },

    searchNotice: () => {
        return new Promise((resolve, reject) => {
            db.query(search_notice_query, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },

    selectNotice: (noticeId) => {
        return new Promise((resolve, reject) => {
            db.query(select_notice_query, noticeId, (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            });
        });
    },

    createNotice: (noticeData) => {
        return new Promise((resolve, reject) => {
            db.query(create_notice_query, noticeData, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },
    createEvent: (eventData) => {
        return new Promise((resolve, reject) => {
            db.query(create_event_query, eventData, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },

    searchEvent: () => {
        return new Promise((resolve, reject) => {
            db.query(search_event_query, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },

    selectEvent: (eventId) => {
        return new Promise((resolve, reject) => {
            db.query(select_event_query, eventId, (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            });
        });
    },

    getAllUsers: () => {
        return new Promise((resolve, reject) => {
            db.query(get_all_users_query, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },

    searchAchive: () => {
        return new Promise((resolve, reject) => {
            db.query(search_achieve_query, (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            });
        });
    },

    selectAchive: (achieveId) => {
        return new Promise((resolve, reject) => {
            db.query(select_achieve_query, achieveId, (err, result) => {
                if (err) reject(err);
                else resolve(result[0]);
            });
        });
    },

    // 관리자 pending List 출력
    popupPendingList: async (user_name) => {
        try {
            const pendingList = await new Promise((resolve, reject) => {
                db.query(pending_query, (err, result) => {
                    if (err) reject(err);
                    else {
                        const pendingData = result.map((data) => ({
                            ...data,
                            image_urls: data.image_urls
                                ? data.image_urls.split(",")
                                : [],
                        }));
                        resolve(pendingData);
                    }
                });
            });
            return pendingList;
        } catch (err) {
            throw err;
        }
    },

    // 관리자 승인 check
    popupPendingCheck: async (store_id) => {
        try {
            await new Promise((resolve, reject) => {
                db.query(pendingCheck_query, store_id, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });

            const user_name = await new Promise((resolve, reject) => {
                db.query(userName_query, store_id, (err, result) => {
                    if (err) reject(err);
                    else resolve(result[0].user_name);
                });
            });

            return user_name;
        } catch (err) {
            throw err;
        }
    },

    // 관리자 거부 및 거부 사유 등록
    popupPendingDeny: async (denyData) => {
        try {
            await new Promise((resolve, reject) => {
                db.query(
                    pendingDeny_query,
                    denyData.store_id,
                    (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    }
                );
            });

            await new Promise((resolve, reject) => {
                db.query(insertDeny_query, denyData, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });

            const user_name = await new Promise((resolve, reject) => {
                db.query(userName_query, denyData.store_id, (err, result) => {
                    if (err) reject(err);
                    else resolve(result[0].user_name);
                });
            });

            return user_name;
        } catch (err) {
            throw err;
        }
    },
};

module.exports = adminModel;
