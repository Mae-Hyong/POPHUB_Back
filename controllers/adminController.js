const adminModel = require('../models/adminModel');

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
}

module.exports = adminController;