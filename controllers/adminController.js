const adminModel = require('../models/adminModel');
const moment = require('moment');

const adminController = {
    createAnswer : async (req, res) => {
        try {
            const { inquiryId, userName, content } = req.body;

            await adminModel.createAnswer(inquiryId, userName, content);
            await adminModel.updateInquiry(inquiryId)
            res.status(201).send(`답변 작성이 완료되었습니다.`);
        } catch (err) {
            console.log(err);
            res.status(500).send("답변 작성 중 오류가 발생했습니다.");
        }
    },

    // 관리자 pending List 조회
    popupPendingList: async(req, res) => {
        try {
            const pendingList = await adminModel.popupPendingList();
            res.status(200).json(pendingList);
        }  catch (err) {
            throw err;
        }
    },

    // 관리자 pending List에서 check값 부여 (승인)
    popupPendingCheck: async(req, res) => {
        try {
            const store_id = req.body.store_id;
            await adminModel.popupPendingCheck(store_id);
            res.status(200).json('check 되었습니다.');
        } catch (err) {
            throw err;
        }
    },

    // 관리자 pending List에서 deny값 부여 (거부)
    popupPendingDeny: async(req, res) => {
        try {
            const { store_id, denial_reason } = req.body;
            const denial_date = moment().format('YYYY-MM-DD HH:mm:ss');
            const denialData = {
                store_id,
                denial_reason,
                denial_date
            }
            await adminModel.popupPendingDeny(denialData);
            res.status(201).json('deny 되었습니다.');
        } catch (err) {
            throw err;
        }
    },
    
}

module.exports = adminController;