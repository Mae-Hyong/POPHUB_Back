const popupModel = require('../models/popupModel');
const moment = require('moment');

const popupController = {
    allPopups: async (req, res) => {
        try {
            const result = await popupModel.allPopups();
            res.status(200).json(result);
        } catch (err) {
            throw err;
        }
    },

    createPopup: async (req, res) => {
        try {
            const popupData = req.body.popupData;
            const popupSchedules = req.body.popupSchedules;

            const popupDataResult = await popupModel.createPopup(popupData); // 팝업 정보
            const store_id = popupDataResult.store_id;
            await popupModel.createSchedule(store_id, popupSchedules); // 팝업 스케줄 정보

            res.status(201).json(`${store_id}가 등록되었습니다.`);
        } catch (err) {
            throw err;
        }
    },

    getPopup: async (req, res) => {
        try {
            const store_id = req.params.store_id;
            const result = await popupModel.getPopup(store_id);
            res.status(200).json(result);
        } catch (err) {
            throw err;
        }
    },

    updatePopup: async (req, res) => {
        try {
            const store_id = req.params.store_id;
            const popupData = req.body.popupData;
            await popupModel.updatePopup(store_id, popupData);
            res.status(200).json(`${store_id} 수정 완료`);
        } catch (err) {
            throw err;
        }
    },

    deletePopup: async (req, res) => {
        try {
            const store_id = req.params.store_id;
            await popupModel.deletePopup(store_id);
            res.status(200).json(`${store_id} 삭제 완료`);

        } catch (err) {
            throw err;
        }
    },

    likePopup: async (req, res) => {
        try {
            const { user_id, store_id } = req.body;
            const like = await popupModel.likePopup(user_id, store_id);
            res.status(201).json(like);
        } catch (err) {
            throw err;
        }
    },

    storeReview: async (req, res) => { // 스토어 리뷰
        try {
            const store_id = req.params.store_id;
            const review = await popupModel.storeReview(store_id);
            res.status(200).json(review);
        } catch (err) {
            throw err;
        }
    },

    storeReviewDetail: async (req, res) => {
        try {
            const review_id = req.params.review_id;
            const reviewDetail = await popupModel.storeReviewDetail(review_id);
            res.status(200).json(reviewDetail);
        } catch (err) {
            throw err;
        }
    },


    createReview: async (req, res) => {
        try {
            const user_id = req.body.user_id;

            if (!user_id) {
                return res.status(400).send("로그인 후 사용해주세요");
            }

            const store_id = req.params.store_id;
            const reviewData = req.body.reviewData;
            const review_date = moment().format('YYYY-MM-DD HH:mm:ss');
            const reviewdata = {
                user_id,
                store_id,
                review_rating: reviewData.review_rating,
                review_content: reviewData.review_content,
                review_date,
            }
            const allreview = await popupModel.createReview(reviewdata);
            res.status(201).json(allreview);
        } catch (err) {
            throw err;
        }
    },

    updateReview: async (req, res) => {
        try {
            const user_id = req.body.user_id;
            if (!user_id) {
                return res.status(400).send("로그인 후 사용해주세요");
            }

            const review_id = req.params.review_id;
            const reviewData = req.body.reviewData;
            const review_modified_date = moment().format('YYYY-MM-DD HH:mm:ss');
            const reviewdata = {
                user_id: req.body.user_id,
                review_rating: reviewData.review_rating,
                review_content: reviewData.review_content,
                review_modified_date,
            }
            await popupModel.updateReview(reviewdata, review_id);
            res.status(200).json('수정이 완료되었습니다.');
        } catch (err) {
            throw err;
        }
    },

    deleteReview: async (req, res) => {
        try {
            const review_id = req.params.review_id;
            await popupModel.deleteReview(review_id);
            res.status(200).json('삭제가 완료되었습니다.');
        } catch (err) {
            throw err;
        }
    }
};

module.exports = { popupController }