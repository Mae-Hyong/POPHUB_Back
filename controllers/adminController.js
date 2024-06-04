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

    createNotice : async (req, res) => {
        try {
            const noticeData = {
                title : title,
                content : content,
                usesr_name : userName
            }

            await adminModel.createNotice(noticeData);
            res.status(201).send("공지사항 작성 완료")
        } catch (err) {
            res.status(500).send("공지사항 작성 중 오류가 발생했습니다.");
        }
    },

    searchNotice : async(req, res) => {
        try {
            const noticeId = req.query.notice_id;
            if(!noticeId){
                const searchResult = await adminModel.searchNotice();
                return res.status(200).json(searchResult);
            }
            else {
                const result = await adminModel.selectNotice(noticeId);
                return res.status(200).json(result);
            }
            
        } catch (err) {
            res.status(500).send("공지사항 조회 중 오류가 발생했습니다.");
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
            const user_name = await adminModel.popupPendingCheck(store_id);
            res.status(200).json(user_name);
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
            const user_name = await adminModel.popupPendingDeny(denialData);
            res.status(201).json(user_name);
        } catch (err) {
            throw err;
        }
    },
}

module.exports = adminController;