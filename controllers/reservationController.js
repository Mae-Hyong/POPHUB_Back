const reservationModel = require('../models/reservationModel');
const moment = require('moment');

const reservationController = {
    searchWaitList: async (req, res) => {
        try {
            const { userName, storeId } = req.query;
            const waitList = await reservationModel.searchUserStoreWait(userName, storeId);
    
            if (waitList.length === 0) {
                res.status(404).json({ message: "현장 대기 중인 팝업이 없습니다! 지금 바로 예약해보세요!" });
            } else {
                res.status(200).json(waitList);
            }
        } catch (err) {
            res.status(500).send('현장 대기 검색 중 오류가 발생했습니다.');
        }
    },

    createWaitList: async (req, res) => {
        try {
            const body = req.body;
            const waitDate = moment().format('YYYY-MM-DD HH:mm:ss');
            const insertData = {
                user_name: body.userName,
                store_id: body.storeId,
                created_at: waitDate,
            };
            await reservationModel.createWaitList(insertData);
            const waitList = await reservationModel.searchUserStoreWait(body.userName, body.storeId);
            res.status(201).send({message: "현장 대기 신청이 완료되었습니다.", waitList: waitList[0].position});
        } catch (err) {
            res.status(500).send('현장 대기 신청 중 오류가 발생하였습니다.');
        }
    },

    admissionWaitList: async (req, res) => {
        try {
            const { userName, storeId } = req.body;

            await reservationModel.admissionWaitList(userName, storeId);
            res.status(201).send("입장이 수락되었습니다.");
        } catch (err) {
            console.log(err);
            res.status(500).send('입장 수락 및 입장 데이터 입력 중 오류가 발생했습니다.');
        }
    },

    cancelWaitList: async (req, res) => {
        try {
            const { userName, storeId } = req.body;

            await reservationModel.cancelWaitList(userName, storeId);
            res.status(200);
        } catch (err) {
            res.status(500).send('현장 대기 예약을 취소하는 중 오류가 발생했습니다.');
        }
    },
};

module.exports = { reservationController };
