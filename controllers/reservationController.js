const reservationModel = require("../models/reservationModel");
const moment = require("moment");
const { sendAlarm } = require("../utils/alarmService");
const admin = require("firebase-admin");

const reservationController = {
    searchWaitList: async (req, res) => {
        try {
            const { userName, storeId } = req.query;

            // 사용자 이름과 스토어 ID가 모두 주어진 경우
            if (userName && storeId) {
                const waitList = await reservationModel.searchUserStoreWait(
                    userName,
                    storeId
                );

                if (waitList.length === 0) {
                    res.status(404).json({
                        message:
                            "현장 대기 중인 팝업이 없습니다! 지금 바로 예약해보세요!",
                    });
                } else {
                    res.status(200).json(waitList);
                }
            }
            // 사용자 이름만 주어진 경우
            else if (userName) {
                const userResult = await reservationModel.searchUserWait(
                    userName
                );
                res.status(200).json(userResult);
            }
            // 스토어 ID만 주어진 경우
            else if (storeId) {
                const storeResult = await reservationModel.searchStoreWait(
                    storeId
                );
                res.status(200).json(storeResult);

                // 선순위부터 알림 보내기
                if (storeResult && storeResult.length > 0) {
                    for (let i = 0; i < storeResult.length; i++) {
                        const reservation = storeResult[i];
                        await sendAlarm(reservation);

                        // 알림 정보를 Firebase에 저장
                        await admin
                            .firestore()
                            .collection("Alarms")
                            .add({
                                user_name: reservation.user_name,
                                store_id: reservation.store_id,
                                reservation_time: reservation.reservation_time,
                                notified_at: new Date(),
                                priority: i + 1,
                            });
                    }
                }
            }
            // userName과 storeId가 모두 없을 경우
            else {
                res.status(400).json({
                    message: "userName 또는 storeId를 제공해야 합니다.",
                });
            }
        } catch (err) {
            console.error(err);
            res.status(500).send("현장 대기 검색 중 오류가 발생했습니다.");
        }
    },

    createWaitList: async (req, res) => {
        try {
            const body = req.body;
            const waitDate = moment().format("YYYY-MM-DD HH:mm:ss");
            const insertData = {
                user_name: body.userName,
                store_id: body.storeId,
                capacity: body.capacity,
                created_at: waitDate,
                reservation_time: body.reservationTime,
                fcm_token: body.fcmToken,
            };
            await reservationModel.createWaitList(insertData);
            const waitList = await reservationModel.searchUserStoreWait(
                body.userName,
                body.storeId
            );
            res.status(201).send({
                message: "현장 대기 신청이 완료되었습니다.",
                waitPosition: waitList[0].position,
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("현장 대기 신청 중 오류가 발생하였습니다.");
        }
    },

    admissionWaitList: async (req, res) => {
        try {
            const { userName, storeId } = req.body;

            await reservationModel.admissionWaitList(userName, storeId);
            res.status(201).send("입장이 수락되었습니다.");
        } catch (err) {
            console.error(err);
            res.status(500).send(
                "입장 수락 및 입장 데이터 입력 중 오류가 발생했습니다."
            );
        }
    },

    cancelWaitList: async (req, res) => {
        try {
            const { userName, storeId } = req.query;

            await reservationModel.cancelWaitList(userName, storeId);
            res.status(200).send("현장 대기 예약이 취소되었습니다.");
        } catch (err) {
            console.error(err);
            res.status(500).send(
                "현장 대기 예약을 취소하는 중 오류가 발생했습니다."
            );
        }
    },
};

module.exports = { reservationController };
