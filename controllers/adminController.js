const adminModel = require("../models/adminModel");
const { sendAlarm } = require("../utils/alarmService");
const admin = require("firebase-admin");
const db = admin.firestore();
const moment = require("moment");
const userModel = require("../models/userModel");

const adminController = {
    searchCategory: async (req, res) => {
        try {
            const categoryId = req.query.categoryId;
            let results; // results 변수를 여기서 정의합니다.

            if (categoryId) {
                results = await adminModel.selectCategory(categoryId);
            } else {
                const result = await adminModel.searchCategory();
                results = await Promise.all(
                    result.map(async (result) => {
                        return {
                            categoryId: result.category_id,
                            categoryName: result.category_name,
                        };
                    })
                );
            }

            if (results) return res.status(200).json(results);
            else return res.status(203).json({ msg: "해당 카테고리 미존재" });
        } catch (err) {
            return res
                .status(500)
                .send("카테고리 조회 중 오류가 발생했습니다.");
        }
    },

    createAnswer: async (req, res) => {
        try {
            const { inquiryId, userName, content } = req.body;

            await adminModel.createAnswer(inquiryId, userName, content);
            await adminModel.updateInquiry(inquiryId);
            const result = await userModel.selectInquiry(inquiryId);
            return res.status(201).json({
                msg: `답변 작성이 완료되었습니다.`,
                userName: result.user_name,
            });
        } catch (err) {
            return res.status(500).send("답변 작성 중 오류가 발생했습니다.");
        }
    },

    searchInquiry: async (req, res) => {
        try {
            const result = await adminModel.searchInquiry();
            const results = await Promise.all(
                result.map(async (result) => {
                    return {
                        inquiryId: result.inquiry_id,
                        userName: result.user_name,
                        title: result.title,
                        writeDate: result.write_date,
                        status: result.status,
                    };
                })
            );
            return res.status(200).json(results);
        } catch (err) {
            return res
                .status(500)
                .send("문의 전체 조회 중 오류가 발생했습니다.");
        }
    },

    createNotice: async (req, res) => {
        try {
            const body = req.body;
            const noticeData = {
                title: body.title,
                content: body.content,
                usesr_name: body.userName,
            };

            await adminModel.createNotice(noticeData);
            return res.status(201).send("공지사항 작성 완료");
        } catch (err) {
            return res
                .status(500)
                .send("공지사항 작성 중 오류가 발생했습니다.");
        }
    },

    searchNotice: async (req, res) => {
        try {
            const noticeId = req.query.notice_id;
            if (!noticeId) {
                const searchResult = await adminModel.searchNotice();
                const results = await Promise.all(
                    searchResult.map(async (searchResult) => {
                        return {
                            noticeId: searchResult.notice_id,
                            userName: searchResult.user_name,
                            title: searchResult.title,
                            createdAt: searchResult.created_at,
                        };
                    })
                );
                return res.status(200).json(results);
            } else {
                const result = await adminModel.selectNotice(noticeId);
                return res.status(200).json(result);
            }
        } catch (err) {
            return res
                .status(500)
                .send("공지사항 조회 중 오류가 발생했습니다.");
        }
    },
    createEvent: async (req, res) => {
        try {
            let img = req.file ? req.file.location : null;
            const body = req.body;
            const eventData = {
                title: body.title,
                content: body.content,
                img: img,
                usesr_name: body.userName,
            };

            await adminModel.createEvent(eventData);

            // 모든 사용자에게 알림 전송
            const users = await adminModel.getAllUsers(); // 모든 사용자 가져오기
            for (const user of users) {
                const alarmData = {
                    user_name: user.user_name,
                    title: eventData.title,
                    content: eventData.content,
                    img: eventData.img,
                    notified_at: new Date(),
                };

                await sendAlarm(alarmData); // 알림 전송
                await db.collection("Alarms").add(alarmData); // Firebase에 알림 저장
            }
            await adminModel.createEvent(eventData);
            return res.status(201).send("공지사항 작성 완료");
        } catch (err) {
            return res
                .status(500)
                .send("공지사항 작성 중 오류가 발생했습니다.");
        }
    },
    createPopupStoreNotification: async (req, res) => {
        try {
            const body = req.body;
            const popupStoreData = {
                store_id: body.storeId,
                store_name: body.storeName,
                opening_date: body.openingDate,
                location: body.location,
            };

            // 모든 사용자에게 알림 전송
            const users = await adminModel.getAllUsers(); // 모든 사용자 가져오기
            for (const user of users) {
                const alarmData = {
                    user_name: user.user_name,
                    title: "팝업 스토어 오픈 예정",
                    content: `${popupStoreData.store_name}이 ${popupStoreData.opening_date}에 ${popupStoreData.location}에서 오픈할 예정입니다.`,
                    notified_at: new Date(),
                };

                await sendAlarm(alarmData); // 알림 전송
                await db.collection("Alarms").add(alarmData); // Firebase에 알림 저장
            }

            return res.status(201).send("팝업 스토어 알림 전송 완료");
        } catch (err) {
            return res
                .status(500)
                .send("팝업 스토어 알림 전송 중 오류가 발생했습니다.");
        }
    },
    searchEvent: async (req, res) => {
        try {
            const eventId = req.query.eventId;
            if (!eventId) {
                const searchResult = await adminModel.searchNotice();
                const results = await Promise.all(
                    searchResult.map(async (searchResult) => {
                        return {
                            noticeId: searchResult.event_id,
                            userName: searchResult.user_name,
                            title: searchResult.title,
                            content: searchResult.content,
                            img: searchResult.img,
                        };
                    })
                );
                return res.status(200).json(results);
            } else {
                const result = await adminModel.selectNotice(eventId);
                return res.status(200).json(result);
            }
        } catch (err) {
            return res.status(500).send("이벤트 조회 중 오류가 발생했습니다.");
        }
    },

    createEvent: async (req, res) => {
        try {
            let img = req.file ? req.file.location : null;
            const body = req.body;
            const eventData = {
                title: body.title,
                content: body.content,
                img: img,
                usesr_name: body.userName,
            };

            await adminModel.createEvent(eventData);
            return res.status(201).send("공지사항 작성 완료");
        } catch (err) {
            return res
                .status(500)
                .send("공지사항 작성 중 오류가 발생했습니다.");
        }
    },

    searchEvent: async (req, res) => {
        try {
            const eventId = req.query.eventId;
            if (!eventId) {
                const searchResult = await adminModel.searchNotice();
                const results = await Promise.all(
                    searchResult.map(async (searchResult) => {
                        return {
                            noticeId: searchResult.event_id,
                            userName: searchResult.user_name,
                            title: searchResult.title,
                            content: searchResult.content,
                            img: searchResult.img,
                        };
                    })
                );
                return res.status(200).json(results);
            } else {
                const result = await adminModel.selectNotice(eventId);
                return res.status(200).json(result);
            }
        } catch (err) {
            return res.status(500).send("이벤트 조회 중 오류가 발생했습니다.");
        }
    },

    searchAchive: async (req, res) => {
        try {
            const achieveId = req.query.achieveId;
            if (!achieveId) {
                const searchResult = await adminModel.searchAchive();
                const results = await Promise.all(
                    searchResult.map(async (searchResult) => {
                        return {
                            achieveId: searchResult.achive_id,
                            userName: searchResult.user_name,
                            title: searchResult.title,
                            content: searchResult.content,
                            conditions: searchResult.conditions,
                            score: searchResult.score,
                        };
                    })
                );
                return res.status(200).json(results);
            } else {
                const result = await adminModel.selectAchive(achieveId);
                return res.status(200).json(result);
            }
        } catch (err) {
            return res.status(500).send("이벤트 조회 중 오류가 발생했습니다.");
        }
    },

    // 관리자 pending List 조회
    popupPendingList: async (req, res) => {
        try {
            const pendingList = await adminModel.popupPendingList();
            return res.status(200).json(pendingList);
        } catch (err) {
            throw err;
        }
    },

    // 관리자 pending List에서 check값 부여 (승인)
    popupPendingCheck: async (req, res) => {
        try {
            const storeId = req.body.storeId;
            const user_name = await adminModel.popupPendingCheck(storeId);
            return res.status(200).json(user_name);
        } catch (err) {
            console.log(err);
            return res.status(500).send("오류 발생");
        }
    },

    // 관리자 pending List에서 deny값 부여 (거부)
    popupPendingDeny: async (req, res) => {
        try {
            const { storeId, denialReason } = req.body;
            const denial_date = moment().format("YYYY-MM-DD HH:mm:ss");
            const denialData = {
                store_id: storeId,
                denial_reason: denialReason,
                denial_date,
            };
            const user_name = await adminModel.popupPendingDeny(denialData);
            return res.status(201).json(user_name);
        } catch (err) {
            return res.status(500).send("오류 발생");
        }
    },
};

module.exports = adminController;
