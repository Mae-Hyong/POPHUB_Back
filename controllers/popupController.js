const popupModel = require('../models/popupModel');
const achieveModel = require('../models/achieveModel');
const userModel = require('../models/userModel')
const moment = require('moment');
const { v4: uuidv4 } = require("uuid");
const { getRecommendation } = require('../function/recommendation');

const popupController = {

    // 모든 팝업 조회
    allPopups: async (req, res) => {
        try {
            const result = await popupModel.allPopups();
            res.status(200).json(result);
        } catch (err) {
            res.status(500).send("전체 팝업 조회 중 오류가 발생하였습니다.");
        }
    },

    // 인기 팝업 조회
    popularPopups: async (req, res) => {
        try {
            const allPopups = await popupModel.allPopups();


            const sortedPopups = allPopups.sort((a, b) => b.store_view_count - a.store_view_count);

            const popularPopups = sortedPopups.slice(0, 5);
            res.status(200).json(popularPopups);
        } catch (err) {
            res.status(500).send("인기 팝업 조회 중 오류가 발생하였습니다.");
        }
    },

    // 팝업 등록자별 조회
    popupByPresident: async (req, res) => {
        try {
            const userName = req.params.userName;
            const result = await popupModel.popupByPresident(userName);
            res.status(200).json(result);
        } catch (err) {
            res.status(500).send("팝업 등록자별 조회 중 오류가 발생하였습니다.");
        }
    },

    // 오픈 - 마감 예정 팝업 조회
    scheduledPopups: async (req, res) => {
        try {
            const type = req.query.type;
            let result;

            if (type == 'open') {
                result = await popupModel.scheduledToOpen();
            } else if (type == 'close') {
                result = await popupModel.scheduledToClose();
            } else {
                return res.status(400).send(" 'open' 또는 'close'를 사용하세요.");
            }

            res.status(200).json(result);
        } catch (err) {
            res.status(500).send("팝업 조회 중 오류가 발생하였습니다.");
        }
    },

    // 스토어 이름 - 카테고리 검색
    searchPopups: async (req, res) => {
        try {
            const { type, storeName, categoryId } = req.query;
            let result;

            if (type == 'storeName' && storeName) {
                result = await popupModel.searchStoreName(storeName);
            } else if (type == 'category' && categoryId) {
                result = await popupModel.searchCategory(categoryId);
            } else {
                return res.status(400).send("검색된 팝업이 없습니다.");
            }

            res.status(200).json(result);
        } catch (err) {
            res.status(500).send("팝업 검색 중 오류가 발생하였습니다.");
        }
    },

    // 팝업 스토어 생성
    createPopup: async (req, res) => {
        try {
            const body = req.body;
            const userName = body.userName;
            const storeId = uuidv4(); // uuid 생성
            const popupData = { // 팝업 스토어 생성에 들어갈 객체
                store_id: storeId,
                category_id: body.categoryId,
                user_name: userName,
                store_name: body.storeName,
                store_location: body.storeLocation,
                store_contact_info: body.storeContactInfo,
                store_description: body.storeDescription,
                max_capacity: body.maxCapacity,
                store_start_date: body.storeStartDate,
                store_end_date: body.storeEndDate,
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
            await popupModel.uploadSchedule(storeId, popupSchedule.schedule); // 팝업 스케줄 정보

            let userImages = [];

            if (req.files) {
                await Promise.all(req.files.map(async (file) => {
                    userImages.push(file.location);
                    await popupModel.uploadImage(storeId, file.location);
                }));
            }

            res.status(201).json(`팝업스토어 등록 요청이 접수되었습니다. 관리자 승인 결과를 기다려 주십시오.`);
        } catch (err) {
            res.status(500).send("팝업 생성 중 오류가 발생하였습니다.");
        }
    },

    // 팝업 스토어 상세 조회 및 수정시 기본 정보 보내기
    getPopup: async (req, res) => {
        try {
            const storeId = req.params.storeId;
            const userName = req.query.userName || null;
            const result = await popupModel.getPopup(storeId, userName);
            res.status(200).json(result);
        } catch (err) {
            res.status(500).send("팝업 상세 조회 중 오류가 발생하였습니다.");
        }
    },

    // 팝업 스토어 수정
    updatePopup: async (req, res) => {
        try {
            const storeId = req.params.storeId;
            const body = req.body;
            const updateData = {
                store_id: storeId,
                category_id: body.categoryId,
                user_name: body.userName,
                store_name: body.storeName,
                store_location: body.storeLocation,
                store_contact_info: body.storeContactInfo,
                store_description: body.storeDescription,
                max_capacity: body.maxCapacity,
                store_start_date: body.storeStartDate,
                store_end_date: body.storeEndDate,
            };

            const popupSchedule = { schedule: [] };

            for (let i = 0; i < body.schedule.length; i++) {
                popupSchedule.schedule.push({
                    day_of_week: body.schedule[i].day_of_week,
                    open_time: body.schedule[i].open_time,
                    close_time: body.schedule[i].close_time
                });
            }

            await popupModel.updatePopup(storeId, updateData);
            let userImages = [];
            await popupModel.uploadSchedule(storeId, popupSchedule.schedule);
            if (req.files) {
                await Promise.all(req.files.map(async (file) => {
                    userImages.push(file.location);
                    await popupModel.uploadImage(storeId, file.location);
                }));
            }
            res.status(200).json(`수정 요청이 접수되었습니다. 관리자 승인 결과를 기다려 주십시오.`);
        } catch (err) {
            res.status(500).send("팝업 수정 중 오류가 발생하였습니다.");
        }
    },

    // 팝업 스토어 삭제
    deletePopup: async (req, res) => {
        try {
            const storeId = req.params.storeId;
            await popupModel.deletePopup(storeId);
            res.status(200).json({ message: "해당 팝업스토어의 정보가 삭제되었습니다." });
        } catch (err) {
            res.status(500).send("팝업 삭제 중 오류가 발생하였습니다.");
        }
    },

    // 거부 사유 확인
    viewDenialReason: async (req, res) => {
        try {
            const storeId = req.params.storeId;
            const check = await popupModel.viewDenialReason(storeId);

            if (check.length === 0) {
                return res.status(404).json({ message: "거부된 팝업 스토어가 존재하지 않습니다." });
            }

            res.status(200).json(check);
        } catch (err) {
            res.status(500).send("팝업 거부 조회 중 오류가 발생하였습니다.");
        }
    },

    // 팝업 스토어 찜
    likePopup: async (req, res) => {
        try {
            const storeId = req.params.storeId;
            const userName = req.body.userName;
            const likeCount = await achieveModel.countBookMark(userName);
            if (likeCount == 10) {
                const achieve = await achieveModel.selectAchiveHub(userName, 3);

                if (!achieve) {
                    await achieveModel.clearAchieve(userName, 3);
                    const result = await achieveModel.selectAchive(3);
                    const insertData = {
                        user_name: userName,
                        points: result.points,
                        description: result.title,
                        calcul: "+"
                    }

                    await achieveModel.addedPoint(insertData);
                    await userModel.updateUserPoints(userName, result.points);
                }
            }
            const like = await popupModel.likePopup(userName, storeId);
            res.status(201).json(like);
        } catch (err) {
            res.status(500).send("팝업 찜 중 오류가 발생하였습니다.");
        }
    },

    // 유저별 찜 조회
    likeUser: async (req, res) => {
        try {
            const userName = req.params.userName;
            const result = await popupModel.likeUser(userName);
            res.status(200).json(result);
        } catch (err) {
            res.status(500).send("사용자별 찜 조회 중 오류가 발생하였습니다.");
        }
    },

    // 팝업별 & 아이디별 리뷰
    storeReview: async (req, res) => {
        try {
            const { type, storeId, userName } = req.query;
            let result;
            if (type == 'store' && storeId) {
                result = await popupModel.storeReview(storeId);
            } else if (type == 'user' && userName) {
                result = await popupModel.storeUserReview(userName);
            } else {
                return res.status(400).send("리뷰 조회 값이 없습니다.");
            }
            res.status(200).json(result);
        } catch (err) {
            res.status(500).send("스토어별 리뷰 조회 중 오류가 발생하였습니다.");
        }
    },

    // 팝업 스토어 리뷰 상세 조회
    storeReviewDetail: async (req, res) => {
        try {
            const reviewId = req.params.reviewId;
            const reviewDetail = await popupModel.storeReviewDetail(reviewId);
            res.status(200).json(reviewDetail);
        } catch (err) {
            res.status(500).send("리뷰 상세 조회 중 오류가 발생하였습니다.");
        }
    },

    // 팝업 스토어 리뷰 생성
    createReview: async (req, res) => {
        try {
            const body = req.body;
            const storeId = req.params.storeId;

            const reviewData = {
                user_name: body.userName,
                store_id: storeId,
                review_rating: body.reviewRating,
                review_content: body.reviewContent,
            }

            // 예약 확인
            const checkReservation = await popupModel.checkReservation(storeId, body.userName);
            if (checkReservation.success) {
                const checkReview = await popupModel.checkReview(storeId, body.userName);
                if (checkReview) { // 리뷰 중복 체크
                    return res.status(400).json({ message: "이미 리뷰를 작성하셨습니다." });
                }
                await popupModel.createReview(reviewData);
                const achieve = await achieveModel.selectAchiveHub(body.userName, 1);

                if (!achieve) {
                    await achieveModel.clearAchieve(body.userName, 1);
                    const result = await achieveModel.selectAchive(1);
                    const insertData = {
                        user_name: body.userName,
                        points: result.points,
                        description: result.title,
                        calcul: "+"
                    }

                    await achieveModel.addedPoint(insertData);
                    await userModel.updateUserPoints(body.userName, result.points);
                }
                return res.status(201).json({ message: "리뷰가 등록되었습니다." });
            }

            res.status(400).json({ message: "리뷰 작성 권한이 없습니다." });
        } catch (err) {
            res.status(500).send("리뷰 생성 중 오류가 발생하였습니다.");
        }
    },

    // 팝업 스토어 리뷰 수정
    updateReview: async (req, res) => {
        try {
            const body = req.body;
            const reviewId = req.params.reviewId;
            const reviewData = {
                user_name: body.userName,
                review_rating: body.reviewRating,
                review_content: body.reviewContent,
            }
            await popupModel.updateReview(reviewData, reviewId);
            res.status(200).json('수정이 완료되었습니다.');
        } catch (err) {
            res.status(500).send("리뷰 수정 중 오류가 발생하였습니다.");
        }
    },

    // 팝업 스토어 리뷰 삭제
    deleteReview: async (req, res) => {
        try {
            const reviewId = req.params.reviewId;
            await popupModel.deleteReview(reviewId);
            res.status(200).json('삭제가 완료되었습니다.');
        } catch (err) {
            res.status(500).send("리뷰 삭제 중 오류가 발생하였습니다.");
        }
    },

    // // 현장 대기 등록
    // waitReservation: async (req, res) => {
    //     try {
    //         const { userName, wait_visitor_name, wait_visitor_number } = req.body;
    //         const storeId = req.params.storeId;
    //         const wait_reservation_time = moment().format('YYYY-MM-DD HH:mm:ss');
    //         const waitReservation = {
    //             storeId,
    //             userName,
    //             wait_visitor_name,
    //             wait_visitor_number,
    //             wait_reservation_time,
    //         }

    //         const status = await popupModel.waitReservation(waitReservation);
    //         res.status(201).json(status);
    //     } catch (err) {
    //         throw err;
    //     }
    // },

    // // 현장 예약자 대기 순서 조회
    // getWaitOrder: async (req, res) => {
    //     try {
    //         const userName = req.body.userName;
    //         const storeId = req.params.storeId;
    //         const waitOrder = await popupModel.getWaitOrder(storeId, userName);
    //         res.status(200).json(waitOrder);
    //     } catch (err) {
    //         throw err;
    //     }
    // },

    // // 팝업 등록자 대기 리스트 확인
    // adminWaitList: async (req, res) => {
    //     try {
    //         const userName = req.body.userName;
    //         const waitList = await popupModel.adminWaitList(userName);
    //         res.status(200).json(waitList);
    //     } catch (err) {
    //         throw err;
    //     }
    // },

    // // 팝업 등록자 팝업 대기 상태 변경 (토글)
    // popupStatus: async (req, res) => {
    //     try {
    //         const storeId = req.params.storeId;
    //         const status = await popupModel.popupStatus(storeId);
    //         res.status(200).json(status);
    //     } catch (err) {
    //         throw err;
    //     }
    // },

    // // 예약자 status 변경
    // waitStatus: async (req, res) => {
    //     try {
    //         const wait_id = req.params.wait_id;
    //         const new_status = req.body.wait_status;
    //         await popupModel.waitStatus(wait_id, new_status);
    //         res.status(200).json(`대기 상태가 ${new_status}로 변경되었습니다.`);
    //     } catch (err) {
    //         throw err;
    //     }
    // },

    // // 예약 삭제
    // waitDelete: async (req, res) => {
    //     try {
    //         const wait_id = req.params.wait_id;
    //         await popupModel.waitDelete(wait_id);
    //         res.status(200).json('삭제되었습니다.');
    //     } catch (err) {
    //         throw err;
    //     }
    // },

    // 추천
    recommendation: async (req, res) => {
        try {
            if (!req.query.userName) {
                return res.status(200).send("로그인 후 추천 시스템을 사용해보세요!");
            } else {
                const {recommendedCategory, recommendedCategories, gender, age} = await getRecommendation(req.query.userName);
                const data = await popupModel.recommendationData(recommendedCategory, recommendedCategories, gender, age);
                res.status(200).json(data);
            }

        } catch (err) {
            res.status(500).send("추천 시스템 확인 오류가 발생하였습니다.");
        }
    },
};

module.exports = { popupController }