const adminModel = require('../models/adminModel');

const adminController = {
    createAnswer : async (req, res) => {
        try {
            const { inquiry_id, user_name, content } = req.body;

            await adminModel.createAnswer(inquiry_id, user_name, content);
            await adminModel.updateInquiry(inquiry_id)
            res.status(201).send(`답변 작성이 완료되었습니다.`);
        } catch (err) {
            console.log(err);
            res.status(500).send("답변 작성 중 오류가 발생했습니다.");
        }
    },
}

module.exports = adminController;