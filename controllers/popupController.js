const popupModel = require('../models/popupModel');
const moment = require('moment');
const { v4: uuidv4 } = require("uuid");

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

    // 인기 팝업 조회
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
            const store_id = uuidv4(); // uuid 생성
            const popupData = { // 팝업 스토어 생성에 들어갈 객체
                store_id,
                category_id: body.category_id,
                user_name: body.user_name, // 
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

            await popupModel.createPopup(popupData); // 팝업 정보 생성
            await popupModel.uploadSchedule(store_id, popupSchedule.schedule); // 팝업 스케줄 정보

            let userImages = [];
            if (req.files) {
                await Promise.all(req.files.map(async (file) => {
                    userImages.push(file.path);
                    await popupModel.uploadImage(store_id, file.path);
                }));
            }

            res.status(201).json(`팝업스토어 등록 요청이 접수되었습니다. 관리자 승인 결과를 기다려 주십시오.`);
        } catch (err) {
            throw err;
        }
    },

    // 팝업 스토어 상세 조회 및 수정시 기본 정보 보내기
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
            const body = req.body;
            const updateData = {
                store_id,
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

            await popupModel.updatePopup(store_id, updateData);
            let userImages = [];
            await popupModel.uploadSchedule(store_id, popupSchedule.schedule);
            if (req.files) {
                await Promise.all(req.files.map(async (file) => {
                    userImages.push(file.path);
                    await popupModel.uploadImage(store_id, file.path);
                }));
            }
            res.status(200).json(`수정 요청이 접수되었습니다. 관리자 승인 결과를 기다려 주십시오.`);
        } catch (err) {
            throw err;
        }
    },

    // 팝업 스토어 삭제
    deletePopup: async (req, res) => {
        try {
            const store_id = req.params.store_id;
            await popupModel.deletePopup(store_id);
            res.status(200).json(`해당 팝업스토어의 정보가 삭제되었습니다.`);

        } catch (err) {
            throw err;
        }
    },

    // 관리자 pending List 조회
    adminPendingList: async(req, res) => {
        try { // 관리자로 로그인 한 경우
            const user_id = req.body.user_id;
            const pendingList = await popupModel.adminPendingList(user_id);
            res.status(200).json(pendingList);
        }  catch (err) {
            throw err;
        }
    },

    // 관리자 pending List에서 check값 부여 (승인)
    adminPendingCheck: async(req, res) => {
        try {
            const { user_id, store_id } = req.body;
            await popupModel.adminPendingCheck(store_id);
            res.status(200).json('check 되었습니다.');
        } catch (err) {
            throw err;
        }
    },

    // 관리자 pending List에서 deny값 부여 (거부)
    adminPendingDeny: async(req, res) => {
        try {
            const { user_id, store_id, denial_reason } = req.body;
            const denial_date = moment().format('YYYY-MM-DD HH:mm:ss');
            const denialData = {
                store_id,
                denial_reason,
                denial_date
            }
            await popupModel.adminPendingDeny(denialData);
            res.status(201).json('deny 되었습니다.');
        } catch (err) {
            throw err;
        }
    },

    // 거부 사유 확인
    viewDenialReason: async(req, res) => {
        try {
            const { user_id, store_id } = req.body;
            const check = await popupModel.viewDenialReason(store_id);
            res.status(200).json(check);
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

    // 특정 팝업 스토어 리뷰
    storeReview: async (req, res) => {
        try {
            const store_id = req.params.store_id;
            const review = await popupModel.storeReview(store_id);
            res.status(200).json(review);
        } catch (err) {
            throw err;
        }
    },

    // 아이디별 팝업 스토어 리뷰
    storeUserReview: async (req, res) => {
        try {
            const user_id = req.body.user_id;
            const review = await popupModel.storeUserReview(user_id);
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
                return res.status(400).json("로그인 후 사용해주세요");
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
            const createReview = await popupModel.createReview(reviewdata, user_id);
            res.status(201).json('리뷰가 등록되었습니다.');
        } catch (err) {
            throw err;
        }
    },

    // 팝업 스토어 리뷰 수정
    updateReview: async (req, res) => {
        try {
            const user_id = req.body.user_id;
            if (!user_id) {
                return res.status(400).json("로그인 후 사용해주세요");
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

    // 대기 등록
    waitReservation: async (req, res) => {
        try {
            const { user_id, wait_visitor_name, wait_visitor_number } = req.body;
            const store_id = req.params.store_id;
            const wait_reservation_time = moment().format('YYYY-MM-DD HH:mm:ss');
            const waitReservation = {
                store_id,
                user_id,
                wait_visitor_name,
                wait_visitor_number,
                wait_reservation_time,
            }
            
            const status = await popupModel.waitReservation(waitReservation);
            res.status(201).json(status);
        } catch (err) {
            throw err;
        }
    },

    // 예약자 대기 순서 조회
    getWaitOrder: async (req, res) => { 
        try {
            const user_id = req.body.user_id;
            const store_id = req.params.store_id;
            const waitOrder = await popupModel.getWaitOrder(store_id, user_id);
            res.status(200).json(waitOrder);
        } catch (err) {
            throw err;
        }
    },

    // 팝업 등록자 대기 리스트 확인
    adminWaitList: async (req, res) => {
        try {
            const user_id = req.body.user_id;
            const waitList = await popupModel.adminWaitList(user_id);
            res.status(200).json(waitList);
        } catch (err) {
            throw err;
        }
    },

    // 팝업 등록자 팝업 대기 상태 변경 (토글)
    adminPopupStatus: async (req, res) => {
        try {
            const user_id = req.body.user_id;
            const store_id = req.params.store_id;
            const status = await popupModel.adminPopupStatus(store_id);
            res.status(200).json(status);
        } catch (err) {
            throw err;
        }
    },
    
    // 예약자 status 변경
    adminWaitStatus: async (req, res) => {
        try {
            const user_id = req.body.user_id;
            const wait_id = req.body.wait_id;
            const new_status = req.body.wait_status;
            await popupModel.adminWaitStatus(wait_id, new_status);
            res.status(200).json(`대기 상태가 ${new_status}로 변경되었습니다.`);
        } catch (err) {
            throw err;
        }
    },

    // 예약 삭제
    adminReservationDelete: async (req, res) => {
        try {
            const user_id = req.body.user_id;
            const wait_id = req.params.wait_id;
            await popupModel.adminReservationDelete(wait_id);
            res.status(200).json('삭제되었습니다.');
        } catch (err) {
            throw err;
        }
    },

};

module.exports = { popupController }