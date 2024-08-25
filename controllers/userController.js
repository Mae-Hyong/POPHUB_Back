const signModel = require("../models/signModel");
const userModel = require("../models/userModel");
const achieveModel = require("../models/achieveModel");

const Token = require("../function/jwt");
const sendMessage = require("../function/message");
const multerimg = require("../function/multer");
// const kakao = require("../function/kakao");

const bcrypt = require("bcrypt");
const { v1 } = require("uuid");
const querystring = require('querystring');
const axios = require('axios');

const kakao = {
    clientID: '15720290ccf0f414e917a24f7db03f13', // 실제 카카오 REST API 키
    redirectUri: 'http://localhost:3000/user/auth/kakao/callback',
};

const signController = {
    signUp: async (req, res) => {
        try {
            const { userId, userPassword, userRole } = req.body;
            const hashedPassword = await bcrypt.hash(userPassword, 10);

            await signModel.signUp(userId, hashedPassword, userRole);

            return res.status(201).send(`${userId}님 회원가입이 완료되었습니다.`);
        } catch (err) {
            return res.status(500).send("회원가입 중 오류가 발생했습니다."); // 클라이언트에게 오류 응답 보내기
        }
    },

    kakaoOauth: async (req, res) => {
        try {
            console.log('kakaoAuthUrl')

            const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${kakao.clientID}&redirect_uri=${kakao.redirectUri}`;
            return res.redirect(kakaoAuthUrl);
        } catch (err) {
            console.error("카카오 인증 요청 오류:", err);
            return res.status(500).send("카카오 인증 요청 중 오류가 발생했습니다.");
        }
    },

    kakaoCallBack: async (req, res) => {
        const { code } = req.query;

        if (!code) {
            return res.status(400).send('No code provided');
        }

        try {
            // 액세스 토큰 요청
            const tokenResponse = await axios.post('https://kauth.kakao.com/oauth/token', querystring.stringify({
                grant_type: 'authorization_code',
                client_id: kakao.clientID,
                redirect_uri: kakao.redirectUri,
                code: code,
            }));

            const accessToken = tokenResponse.data.access_token;

            // 액세스 토큰을 이용해 사용자 정보 요청
            const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // 사용자 정보 처리 및 응답
            const userInfo = userResponse.data;
            return res.json(userInfo); // 사용자 정보를 JSON 형태로 반환
        } catch (error) {
            console.error('Error during Kakao login:', error.response ? error.response.data : error.message);
            return res.status(500).send('Failed to login with Kakao');
        }
    },

    signIn: async (req, res) => {
        try {
            const { userId, authPassword } = req.body;
            const userPassword = await signModel.signIn(userId);
            const isPasswordValid = await bcrypt.compare(authPassword, userPassword);

            if (isPasswordValid) {
                const token = Token.generateToken(userId);
                await achieveModel.checkAndAddAchieve(userId);
                return res.status(200).json({ user_id: userId, token });
            } else {
                return res.status(401).send("Invalid password");
            }
        } catch (err) {
            return res.status(500).send("로그인 중 오류가 발생했습니다.");
        }
    },
};

const authController = {
    certification: async (req, res) => {
        try {
            const phoneNumber = req.body.phoneNumber;
            const Number = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");

            sendMessage(phoneNumber, Number);
            return res.status(200).json({
                phoneNumber: phoneNumber,
                Number: Number,
            });
        } catch (err) {
            return res.status(500).send("메세지 전송 중 오류가 발생했습니다.");
        }
    },

    verifyCertification: async (req, res) => {
        try {
            const { authCode, expectedCode } = req.body;

            if (authCode === expectedCode) res.status(200).send("Successful !");
            else res.status(401).send("Failed. Invalid code.");
        } catch (err) {
            return res.status(500).send("인증 중 오류가 발생했습니다.");
        }
    },
};

const userController = {
    searchUser: async (req, res) => {
        try {
            const userId = req.params.userId;

            // 아이디가 안담겨 왔을때
            if (!userId) return res.status(400).json({ resultMsg: "사용자 ID를 제공해야 합니다." });

            const result = await userModel.searchUser(userId);
            const role = await userModel.searchJoin(userId);

            if (!result || result.length === 0)
                return res.status(404).send("User not found");
            return res.status(200).json({
                userId: result.user_id,
                userName: result.user_name,
                phoneNumber: result.phone_number,
                pointScore: result.point_score,
                gender: result.gender,
                age: result.age,
                userImage: result.user_image,
                userRole: role.user_role,
            });
        } catch (err) {
            return res.status(500).send("데이터 검색 중 오류가 발생했습니다.");
        }
    },

    doubleCheck: async (req, res) => {
        try {
            const userId = req.query.userId;
            const userName = req.query.userName;

            // 아이디 혹은 유저 네임이 안담겨 왔을때
            if (!userId && !userName) {
                return res.status(400).json({ resultMsg: "사용자 userName 혹은 Id를 제공해야 합니다." });
            }

            if (userId) {
                const result = await userModel.userDoubleCheck(userId, null);
                if (!result) return res.status(200).json("User ID not found");
                return res.status(200).json("User ID Exists");
            } else {
                const result = await userModel.userDoubleCheck(null, userName);
                if (!result) return res.status(200).json("User Name not found");
                return res.status(200).json("User Name Exists");
            }
        } catch (err) {
            return res.status(500).send("Double Check 중 오류가 발생했습니다.");
        }
    },

    searchId: async (req, res) => {
        try {
            const phoneNumber = req.query.phoneNumber;
            if (!phoneNumber) return res.send("사용자의 Phone Number을 제공해야 합니다.").status(400);

            const result = await userModel.searchId(phoneNumber);

            if (result.length === 0) return res.status(404).send("User not found");
            return res.status(200).json({ userId: result.user_id });
        } catch (err) {
            return res.status(500).send("ID 검색 중 오류가 발생했습니다.");
        }
    },

    changePassword: async (req, res) => {
        try {
            const { userId, userPassword } = req.body;
            const hashedPassword = await bcrypt.hash(userPassword, 10);

            if (!userId) return res.send("사용자의 Id를 제공해야 합니다.").status(400);

            await userModel.changePassword(userId, hashedPassword);
            return res.status(200).send("Password Change successfully");
        } catch (err) {
            return res.status(500).send("비밀번호 변경 중 오류가 발생했습니다.");
        }
    },

    createProfile: async (req, res) => {
        try {
            const { userId, userName, phoneNumber, Gender, Age } = req.body;
            try {
                let userImage = req.file ? req.file.location : null;
                await userModel.createProfile(userId, userName, phoneNumber, Gender, Age, userImage);
                await achieveModel.clearAchieve(userName, 2);

                return res.status(201).send("Profile added successfully");
            } catch (error) {
                return res.status(500).json({
                    resultMsg: "이미지를 Cloudinary에 업로드하는 도중 오류가 발생했습니다.",
                    error: error.message,
                });
            }
        } catch (err) {
            return res.status(500).send("프로필 생성 중 오류가 발생했습니다.");
        }
    },

    updateProfile: async (req, res) => {
        try {
            const { userId, userName } = req.body;
            try {
                let userImage = req.file ? req.file.location : null;

                if (!userName) {
                    const result = await userModel.searchUser(userId);
                    await multerimg.deleted(result.user_image);
                    await userModel.updateImage(userId, userImage);
                    return res.status(200).send("Profile userImage successfully");
                } else if (!userImage) {
                    await userModel.updateName(userId, userName);
                    return res.status(200).send("Profile userName successfully");
                } else {
                    const result = await userModel.searchUser(userId);
                    await multerimg.deleted(result.user_image);
                    await userModel.updateName(userId, userName);
                    await userModel.updateImage(userId, userImage);
                }

                return res.status(200).send("Profile Modify successfully");
            } catch (error) {
                return res.status(500).json({
                    resultMsg: "이미지를 Cloudinary에 업로드하는 도중 오류가 발생했습니다.",
                    error: error.message,
                });
            }
        } catch (err) {
            return res.status(500).send("프로필 생성 중 오류가 발생했습니다.");
        }
    },

    deleteUser: async (req, res) => {
        try {
            const { userId, phoneNumber } = req.body;
            const userName = v1();

            await userModel.deleteData(userId, phoneNumber);
            await userModel.deleteChange(userName, true, userId);
            await userModel.deleteUser(userId);

            res.status(200).send("user Delete succeddfully");
        } catch (err) {
            return res.status(500).send("유저 삭제 중 오류가 발생했습니다.");
        }
    },

    createInquiry: async (req, res) => {
        try {
            const { userName, categoryId, title, content } = req.body;
            let userImage = null;
            if (req.file) userImage = req.file ? req.file.location : '';

            await achieveModel.clearAchieve(userName, 7);
            await userModel.createInquiry(userName, categoryId, title, content, userImage);
            res.status(201).send("Inquiry added successfully");
        } catch (err) {
            return res.status(500).send("문의 생성 중 오류가 발생했습니다.");
        }
    },

    searchInquiry: async (req, res) => {
        try {
            const userName = req.query.userName;
            const inquiryId = req.query.inquiryId;

            if (userName) {
                // userName이 존재할 경우
                const result = await userModel.searchInquiry(userName);
                const results = await Promise.all(
                    result.map(async (result) => {
                        const category = await userModel.category(result.category_id);
                        return {
                            inquiryId: result.inquiry_id,
                            userName: result.user_name,
                            categoryId: result.category_id,
                            category: category[0].category_name,
                            title: result.title,
                            writeDate: result.write_date,
                            answerStatus: result.status,
                        };
                    })
                );

                return res.status(200).json(results);
            } else if (inquiryId) {
                const result = await userModel.selectInquiry(inquiryId);
                const category = await userModel.category(result.category_id);
                return res.status(200).json({
                    inquiryId: result.inquiry_id,
                    userName: result.user_name,
                    categoryId: result.category_id,
                    category: category[0].category_name,
                    title: result.title,
                    content: result.content,
                    image: result.image,
                    writeDate: result.write_date,
                    answerStatus: result.status,
                });
            }
        } catch (err) {
            return res.status(500).send("문의 검색 중 오류가 발생했습니다.");
        }
    },

    searchAnswer: async (req, res) => {
        try {
            const inquiryId = req.query.inquiryId;
            if (!inquiryId) {
                return res.status(400).json({ resultMsg: "문의 Id를 제공해야합니다." });
            }
            const result = await userModel.searchAnswer(inquiryId);
            if (!result) return res.status(404).send("Answer not found");
            return res.status(200).json({
                answerId: result[0].answer_id,
                inquiryId: result[0].inquiry_id,
                userName: result[0].user_name,
                content: result[0].content,
                writeDate: result[0].write_date,
            });
        } catch (err) {
            return res.status(500).send("문의 내역을 가져오는 중 오류가 발생했습니다.");
        }
    },

    clearAchieve: async (req, res) => { // 추후 조건에 맞춰 쪼개질 예정
        try {
            const { userName, achieveId } = req.body;
            if (userName && achieveId) {
                await achieveModel.clearAchieve(userName, achieveId);
                return res.status(201).json({ Msg: "clear achieve" });
            } else return res.status(404).send("userName or achieveId not found");
        } catch (err) {
            return res.status(500).send("achieve Hub에 입력 중 오류가 발생했습니다.");
        }
    },

    searchAchiveHub: async (req, res) => {
        try {
            const userName = req.query;
            if (userName && achieveId) {
                const searchResult = await achieveModel.searchAchiveHub(userName);
                const results = await Promise.all(searchResult.map(async (searchResult) => {
                    return {
                        achiveId: searchResult.achive_id,
                        userName: searchResult.user_name,
                        completeAt: searchResult.complete_at
                    };
                }));
                return res.status(200).json(results);
            } else return res.status(404).send("userName or achieveId not found");

        } catch (err) {
            return res.status(500).send("이벤트 조회 중 오류가 발생했습니다.");
        }
    },

    gainPoint: async (req, res) => {
        try {
            const body = req.body;
            const insertData = {
                user_name: body.userName,
                points: body.points,
                description: body.description,
                calcul: body.calcul
            };
            await userModel.gainPoint(insertData);
            return res.status(201).json({ Msg: "gainPoint" });
        } catch (err) {
            return res.status(500).send("point 입력 중 오류가 발생했습니다.");
        }
    },

    searchPoint: async (req, res) => {
        try {
            const userName = req.query.userName;
            const searchResult = await userModel.searchPoint(userName);
            const result = await Promise.all(searchResult.map(async (searchResult) => {
                return {
                    userName: searchResult.user_name,
                    point_score: searchResult.points,
                    description: searchResult.description,
                    calcul: searchResult.calcul
                };
            }));
            return res.status(200).json(result);
        } catch (err) {
            console.log(err);
            return res.status(500).send("point 조회 중 오류가 발생했습니다.");
        }
    }

};

module.exports = {
    signController: signController,
    authController: authController,
    userController: userController,
};
