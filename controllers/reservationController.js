const reservationModel = require("../models/reservationModel");
const qrCodeModel = require('../models/qrCodeModel');
const achieveModel = require("../models/achieveModel");
const userModel = require('../models/userModel')
const { sendAlarm } = require("../function/alarmService");
const admin = require("firebase-admin");
const { v4: uuidv4 } = require("uuid");

const reservationController = {
    // 스토어별 사전 예약 상태
    reservationStatus: async (req, res) => {
        try {
            const storeId = req.params.storeId;
            const result = await reservationModel.reservationStatus(storeId);
            res.status(200).json(result);
        } catch (err) {
            res.status(500).send("스토어별 예약 상태 확인 중 오류가 발생하였습니다.");
        }
    },

    // 사전 예약
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

            const check = await reservationModel.checkStatusForReservation(req.body.userName, storeId);
            if (!check.success) {
                return res.status(400).json({ message: "현재 해당 팝업 스토어에 사전 예약이 되어 있습니다. 방문 이후 재예약이 가능합니다." });
            }

            const result = await reservationModel.reservation(reservationData);

            if (result.success == true) {
                res.status(201).json(`사전 예약 등록이 완료되었습니다. 현재 인원:${result.update_capacity}, 최대 인원: ${result.max_capacity}`);
            } else {
                res.status(400).json(`최대 인원을 초과하였습니다. 시간당 최대 인원:${result.max_capacity}`);
            }
        } catch (err) {
            res.status(500).send("사전 예약 중 오류가 발생하였습니다.");
        }
    },

    // 사전 예약 조회 - 유저 & 판매자
    getReservation: async (req, res) => {
        try {
            const { type, userName, storeId } = req.query;
            let result;
            if (type == "user" && userName) {
                result = await reservationModel.getReservationUser(userName);
            } else if (type == "president" && storeId) {
                result = await reservationModel.getReservationPresident(storeId);
            } else {
                return res.status(400).send("예약 조회 값이 없습니다.");
            }

            res.status(200).json(result);
        } catch (err) {
            res.status(500).send("예약 조회 중 오류가 발생하였습니다.");
        }
    },

    // 사전 예약 입장 성공
    completedReservation: async (req, res) => {
        try {
            const reservationId = req.query.reservationId;
            const result = await reservationModel.completedReservation(reservationId);
            
            if (result && result.length > 0) {
                const calendarData = {
                    user_name: result[0].user_name,
                    store_id: result[0].store_id,
                    reservation_date: result[0].reservation_date
                };

                try {
                    await qrCodeModel.createCalendar(calendarData);
                    const achieve = await achieveModel.selectAchiveHub(result[0].user_name, 6);

                    if (!achieve) {
                        await achieveModel.clearAchieve(result[0].user_name, 6);
                        const data = await achieveModel.selectAchive(6);
                        const insertData = {
                            user_name: result[0].user_name,
                            points: data.points,
                            description: data.title,
                            calcul: "+"
                        }

                        await achieveModel.addedPoint(insertData);
                        await userModel.updateUserPoints(result[0], data.points);
                    }

                } catch (err) {
                    return res.status(500).json({ message: "처리된 방문인증입니다." });
                }
            }
            res.status(201).json({ message: "입장이 성공적으로 완료되었습니다.", userName: result[0].user_name });
        } catch (err) {
            res.status(500).json({ message: "사전 예약 입장 수락 중 오류가 발생하였습니다." });
        }
    },

    // 사전 예약 취소
    deleteReservation: async (req, res) => {
        try {
            const reservationId = req.params.reservationId;
            const check = await reservationModel.deleteReservation(reservationId);
            if(check === 0) {
                return res.status(404).json({ message: "입장된 예약은 취소가 불가능합니다." });
            } else {
                res.status(200).json({ message: "사전 예약이 정상적으로 취소되었습니다."});
            }
            
        } catch (err) {
            res.status(500).send("사전 예약 취소 중 오류가 발생하였습니다.");
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
            } else if (userName) { // 사용자 이름만 주어진 경우
                const userResult = await reservationModel.searchUserWait(userName);
                res.status(200).json(userResult);
            } else if (storeId) {  // 스토어 ID만 주어진 경우
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
            } else { // userName과 storeId가 모두 없을 경우
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

            const count = result.length > 0 ? result.length : 0;

            res.status(200).json({ result, count });
        } catch (err) {
            res.status(500).send("현장 대기 조회 중 오류가 발생하였습니다.");
        }
    },

    // 현장 대기
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
            const check = await reservationModel.checkStatusForWaitList(
                body.userName,
                body.storeId
            );
            if (!check.success) {
                return res.status(400).json({ message: "동일 팝업 스토어의 현장 대기 신청을 중복하여 할 수 없습니다." });
            }
            await reservationModel.createWaitList(insertData);
            const waitList = await reservationModel.searchUserStoreWait(body.userName, body.storeId);
            res.status(201).send({ message: "현장 대기 신청이 완료되었습니다.", waitPosition: waitList[0].position });
        } catch (err) {
            res.status(500).send("현장 대기 신청 중 오류가 발생하였습니다.");
        }
    },

    createWaiting: async (req, res) => {
        try {
            const body = req.body;
            const reservationId = uuidv4();
            const insertData = {
                reservation_id: reservationId,
                user_name: body.userName,
                store_id: body.storeId,
                capacity: body.capacity,
                phone_number: body.phoneNumber
            };
            const check = await reservationModel.checkStatusForWaitList(
                body.userName,
                body.storeId
            );
            if (!check.success) {
                return res.status(400).json({ message: "동일 팝업 스토어의 현장 대기 신청을 중복하여 할 수 없습니다." });
            }
            await reservationModel.createWaitList(insertData);
            const waitList = await reservationModel.searchUserStoreWait(body.userName, body.storeId);
            res.status(201).send({ message: "현장 대기 신청이 완료되었습니다.", waitPosition: waitList[0].position });
        } catch (err) {
            console.log(err);
            res.status(500).send("현장 대기 신청 중 오류가 발생하였습니다.");
        }
    },

    admissionWaitList: async (req, res) => {
        try {
            const { reservationId } = req.body;
            const result = await reservationModel.admissionWaitList(reservationId);
            if (result && result.length > 0) {
                const calendarData = {
                    user_name: result[0].user_name,
                    store_id: result[0].store_id,
                    reservation_date: result[0].created_at
                };

                try {
                    await qrCodeModel.createCalendar(calendarData);
                } catch (err) {
                    return res.status(500).json({ message: "처리된 방문인증입니다." });
                }
            }

            res.status(201).json({ message: "입장이 수락되었습니다." });
        } catch (err) {
            res.status(500).send("입장 수락 및 입장 데이터 입력 중 오류가 발생했습니다.");
        }
    },

    cancelWaitList: async (req, res) => {
        try {
            const { reservationId } = req.query;
            const check = await reservationModel.cancelWaitList(reservationId);
            if (check === 0) {
                return res.status(404).json({ message: "입장된 예약은 취소가 불가능합니다." });
            } else {
                res.status(200).send({ message: "현장 대기 예약이 취소되었습니다." });
            }
        } catch (err) {
            res.status(500).send("현장 대기 예약을 취소하는 중 오류가 발생했습니다.");
        }
    },
};

module.exports = { reservationController };
