const reservationModel = require("../models/reservationModel");
const achieveModel = require('../models/achieveModel');
const { sendAlarm } = require("../util/alarmService");
const admin = require("firebase-admin");
const { v4: uuidv4 } = require("uuid");

const reservationController = {
    // 스토어별 예약 상태
    reservationStatus: async (req, res) => {
        try {
            const storeId = req.params.storeId;
            const result = await reservationModel.reservationStatus(storeId);
            res.status(200).json(result);
        } catch (err) {
            res.status(500).send("스토어별 예약 상태 확인 중 오류가 발생하였습니다.");
        }
    },

    // 예약
    reservation: async (req, res) => {
        try {
            const storeId = req.query.storeId;
            const reservationId = uuidv4();
            let reservationData = {
                reservation_id: reservationId,
                store_id: storeId,
                user_name: req.body.userName,
                reservation_date: req.body.reservationDate,
                reservation_time: req.body.reservationTime,
                capacity: req.body.capacity,
            };

            const result = await reservationModel.reservation(reservationData);

            if (result.success == true) {
                res.status(201).json(`예약 등록이 완료되었습니다. 현재 인원:${result.update_capacity}, 최대 인원: ${result.max_capacity}`);
            } else {
                res.status(400).json(`최대 인원을 초과하였습니다. 시간당 최대 인원:${result.max_capacity}`);
            }
        } catch (err) {
            res.status(500).send("예약 중 오류가 발생하였습니다.");
        }
    },

    // 예약 조회 - 유저 & 판매자
    getReservation: async (req, res) => {
        try {
            const { type, userName, storeId } = req.query;
            let result;
            if (type == 'user' && userName) {
                result = await reservationModel.getReservationUser(userName);
            } else if (type == 'president' && storeId) {
                result = await reservationModel.getReservationPresident(storeId);
            } else {
                return res.status(400).send("예약 조회 값이 없습니다.");
            }

            res.status(200).json(result);
        } catch (err) {
            res.status(500).send("예약 조회 중 오류가 발생하였습니다.");
        }
    },

    // 예약 입장 성공
    completedReservation: async (req, res) => {
        try {
            const reservationId = req.query.reservationId;
            const result = await reservationModel.completedReservation(reservationId);
            await achieveModel.clearAchieve(result, 6);
            res.status(200).json({ message: "입장이 성공적으로 완료되었습니다.", userName: result });
        } catch (err) {
            res.status(500).send("사전 예약 입장 수락 중 오류가 발생하였습니다.");
        }
    },

    // 예약 취소
    deleteReservation: async (req, res) => {
        try {
            const reservationId = req.params.reservationId;
            await reservationModel.deleteReservation(reservationId);
            res.status(200).json("예약이 취소되었습니다.");
        } catch (err) {
            res.status(500).send("예약 삭제 오류가 발생하였습니다.");
        }
    },

    searchWaitList: async (req, res) => {
        try {
            const { userName, storeId } = req.query;

            // 사용자 이름과 스토어 ID가 모두 주어진 경우
            if (userName && storeId) {
                const waitList = await reservationModel.searchUserStoreWait(userName, storeId);

                if (waitList.length === 0) {
                    return res.status(404).json({ message: "현장 대기 중인 팝업이 없습니다! 지금 바로 예약해보세요!" });
                }

                res.status(200).json(waitList);
            }
            // 사용자 이름만 주어진 경우
            else if (userName) {
                const userResult = await reservationModel.searchUserWait(userName);
                res.status(200).json(userResult);
            }
            // 스토어 ID만 주어진 경우
            else if (storeId) {
                const storeResult = await reservationModel.searchStoreWait(storeId);
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
                res.status(400).json({ message: "userName 또는 storeId를 제공해야 합니다." });
            }
        } catch (err) {
            res.status(500).send("현장 대기 조회 중 오류가 발생하였습니다.");
        }
    },

    searchWaitListPopup: async (req, res) => {
        try {
            const storeId = req.query.storeId;
            const result = await reservationModel.searchStoreWait(storeId);

            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(500).send("현장 대기 조회 중 오류가 발생하였습니다.");
        }
    },

    createWaitList: async (req, res) => {
        try {
            const body = req.body;
            const reservationId = uuidv4();
            const insertData = {
                reservation_id: reservationId,
                user_name: body.userName,
                store_id: body.storeId,
                capacity: body.capacity,
                // reservation_time: body.reservationTime,
                // fcm_token: body.fcmToken,
            };
            await reservationModel.createWaitList(insertData);
            const waitList = await reservationModel.searchUserStoreWait(body.userName, body.storeId);
            res.status(201).send({
                message: "현장 대기 신청이 완료되었습니다.",
                waitPosition: waitList[0].position,
            });
        } catch (err) {
            res.status(500).send("현장 대기 신청 중 오류가 발생하였습니다.");
        }
    },

    admissionWaitList: async (req, res) => {
        try {
            const { userName, storeId } = req.body;

            await reservationModel.admissionWaitList(userName, storeId);
            res.status(201).json({ message: "입장이 수락되었습니다." });
        } catch (err) {
            res.status(500).send("입장 수락 및 입장 데이터 입력 중 오류가 발생했습니다.");
        }
    },

    cancelWaitList: async (req, res) => {
        try {
            const { userName, storeId } = req.query;

            await reservationModel.cancelWaitList(userName, storeId);
            res.status(200).send({ message: "현장 대기 예약이 취소되었습니다." });
        } catch (err) {
            res.status(500).send("현장 대기 예약을 취소하는 중 오류가 발생했습니다.");
        }
    },
};

module.exports = { reservationController };
