const popupModel = require('../models/popupModel');
const moment = require('moment');

const popupController = {
    // 모든 팝업 조회
    allPopups: async (req, res) => {
        try {
            const result = await popupModel.allPopups();
            res.status(200).json(result);
        } catch (err) {
            throw err;
        }
    },

    popularPopups: async (req, res) => {
        try {
            const popular = await popupModel.popularPopups();
            res.status(200).json(popular);
        } catch (err) {
            throw err;
        }
    },

    // 팝업 스토어 생성
    createPopup: async (req, res) => {
        try {
            const body = req.body;

            const popupData = { // 팝업 스토어 생성에 들어갈 객체
                category_id: body.category_id,
                user_name: body.user_name,
                store_name: body.store_name,
                store_location: body.store_location,
                store_contact_info: body.store_contact_info,
                store_description: body.store_description,
                store_start_date: body.store_start_date,
                store_end_date: body.store_end_date,
            };

            const popupSchedule = { schedule: [] };

            for (let i = 0; i < body.schedule.length; i++) {
                const daySchedule = body.schedule[i];
                const dayOfWeek = daySchedule.day_of_week;
                const openTime = daySchedule.open_time;
                const closeTime = daySchedule.close_time;

                popupSchedule.schedule.push({
                    day_of_week: dayOfWeek,
                    open_time: openTime,
                    close_time: closeTime
                });
            }

            const popupDataResult = await popupModel.createPopup(popupData); // 팝업 정보
            const store_id = popupDataResult.store_id;
            await popupModel.createSchedule(store_id, popupSchedule.schedule); // 팝업 스케줄 정보

            let userImages = [];
            if (req.files) {
                await Promise.all(req.files.map(async (file) => {
                    userImages.push(file.path);
                    await popupModel.createImage(store_id, file.path);
                    console.log(file.path);
                }));
            }

            res.status(201).json(`${store_id}가 등록되었습니다.`);
        } catch (err) {
            throw err;
        }
    },

    // 팝업 스토어 상세 조회
    getPopup: async (req, res) => {
        try {
            const store_id = req.params.store_id;
            const result = await popupModel.getPopup(store_id);
            res.status(200).json(result);
        } catch (err) {
            throw err;
        }
    },

    // 팝업 스토어 수정
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

    // 팝업 스토어 삭제
    deletePopup: async (req, res) => {
        try {
            const store_id = req.params.store_id;
            await popupModel.deletePopup(store_id);
            res.status(200).json(`${store_id} 삭제 완료`);

        } catch (err) {
            throw err;
        }
    },

    // 팝업 스토어 찜
    likePopup: async (req, res) => {
        try {
            const { user_id, store_id } = req.body;
            const like = await popupModel.likePopup(user_id, store_id);
            res.status(201).json(like);
        } catch (err) {
            throw err;
        }
    },

    // 팝업 스토어 리뷰
    storeReview: async (req, res) => {
        try {
            const store_id = req.params.store_id;
            const review = await popupModel.storeReview(store_id);
            res.status(200).json(review);
        } catch (err) {
            throw err;
        }
    },


    // 팝업 스토어 리뷰 상세 조회
    storeReviewDetail: async (req, res) => {
        try {
            const review_id = req.params.review_id;
            const reviewDetail = await popupModel.storeReviewDetail(review_id);
            res.status(200).json(reviewDetail);
        } catch (err) {
            throw err;
        }
    },

    // 팝업 스토어 리뷰 생성
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

    // 팝업 스토어 리뷰 수정
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

    // 팝업 스토어 리뷰 삭제
    deleteReview: async (req, res) => {
        try {
            const review_id = req.params.review_id;
            await popupModel.deleteReview(review_id);
            res.status(200).json('삭제가 완료되었습니다.');
        } catch (err) {
            throw err;
        }
    },

    // 팝업 대기 상태 변경
    adminWait: async (req, res) => {
        try {
            const user_id = req.body.user_id;
            const store_id = req.params.store_id;
            const status = await popupModel.adminWait(store_id);
            res.status(200).json({ status });
        } catch (err) {
            throw err;
        }
    },

    // 예약자 대기 상태 변경
    adminWaitAccept: async (req, res) => {
        try {
            // 로그인 유무 판단
            const user_id = req.body.user_id; // 예약자 아이디
            const store_id = req.params.store_id;
            const status = await popupModel.adminWaitAccept(user_id, store_id);
            res.status(200).json({ status });
        } catch (err) {
            throw err;
        }
    },

    adminCompleted: async (req, res) => {
        try {
            const store_id = req.params.store_id;
            await popupModel.adminCompleted(store_id);
            res.status(200).json('전체 삭제되었습니다.');
        } catch (err) {
            throw err;
        }
    },

    waitReservation: async (req, res) => { // 대기 등록
        try {
            const { user_id, wait_visitor_name, wait_visitor_number } = req.body;
            const store_id = req.params.store_id;
            const wait_reservation_time = moment().format('HH:mm:ss');
            const waitReservation = {
                store_id,
                user_id,
                wait_visitor_name,
                wait_visitor_number,
                wait_reservation_time
            }

            const status = await popupModel.waitReservation(waitReservation);
            res.status(201).json(status);
        } catch (err) {
            throw err;
        }
    },

    getWaitOrder: async (req, res) => { // 예약자 대기 순서 조회
        try {
            const { user_id } = req.body;
            const store_id = req.params.store_id;
            const waitOrder = await popupModel.getWaitOrder(store_id, user_id);
            res.status(200).json(waitOrder);
        } catch (err) {
            throw err;
        }
    }
};

module.exports = { popupController }