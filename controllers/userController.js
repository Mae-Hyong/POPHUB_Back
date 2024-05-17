const signModel = require("../models/signModel");
const userModel = require("../models/userModel");

const Token = require("../function/jwt");
const sendMessage = require("../function/message");

const bcrypt = require("bcrypt");

const signController = {
  signUp: async (req, res) => {
    try {
      const { userId, userPassword, userRole } = req.body;
      const hashedPassword = await bcrypt.hash(userPassword, 10);

      await signModel.signUp(userId, hashedPassword, userRole);

      res.status(201).send(`${userId}님 회원가입이 완료되었습니다.`);
    } catch (err) {
      console.log(err);
      res.status(500).send("회원가입 중 오류가 발생했습니다."); // 클라이언트에게 오류 응답 보내기
    }
  },

  signIn: async (req, res) => {
    try {
      const { userId, authPassword } = req.body;
      const userPassword = await signModel.signIn(userId);
      const isPasswordValid = await bcrypt.compare(authPassword, userPassword);

      if (isPasswordValid) {
        const token = Token.generateToken(userId);
        return res.status(200).json({ user_id: userId, token });
      } else {
        res.status(401).send("Invalid password");
      }
    } catch (err) {
      console.log(err);
      res.status(500).send("로그인 중 오류가 발생했습니다.");
    }
  },
};

const authController = {
  certification: async (req, res) => {
    try {
      const phoneNumber = req.body.phoneNumber;
      const Number = String(Math.floor(Math.random() * 1000000)).padStart(
        6,
        "0"
      );

      sendMessage(phoneNumber, Number);
      return res.status(200).json({
        phoneNumber: phoneNumber,
        Number: Number,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("메세지 전송 중 오류가 발생했습니다.");
    }
  },

  verifyCertification: async (req, res) => {
    try {
      const { authCode, expectedCode } = req.body;

      if (authCode === expectedCode) res.status(200).send("Successful !");
      else res.status(401).send("Failed. Invalid code.");
    } catch (err) {
      console.log(err);
      res.status(500).send("인증 중 오류가 발생했습니다.");
    }
  },
};

const userController = {
  searchUser: async (req, res) => {
    try {
      const userId = req.params.userId;

      // 아이디가 안담겨 왔을때
      if (!userId) {
        return res.status(400).json({
          resultCode: 400,
          resultMsg: "사용자 ID를 제공해야 합니다.",
        });
      }

      const result = await userModel.searchUser(userId);

      if (!result || result.length === 0) {
        res.status(404).send("User not found");
        return;
      }
      return res.status(200).json({
        userId: result.user_id,
        userName: result.user_name,
        phoneNumber: result.phone_number,
        pointScore: result.point_score,
        gender: result.gender,
        age: result.age,
        userImage: result.user_image,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("데이터 검색 중 오류가 발생했습니다.");
    }
  },

  doubleCheck: async (req, res) => {
    try {
      const userId = req.params.userId;
      const userName = req.params.userName;

      // 아이디 혹은 유저 네임이 안담겨 왔을때
      if (!userId && !userName) {
        return res.status(400).json({
          resultCode: 400,
          resultMsg: "사용자 userName 혹은 Id를 제공해야 합니다.",
        });
      }

      if (userId) {
        const result = await userModel.searchUser(userId);
        if (result.length === 0) {
          return res.status(200).send("User ID not found");
        }
        return res.status(200).send("User ID Exists");
      } else {
        const result = await searchUser(userName);
        if (result.length === 0) {
          console.log("User Name not found");
          return res.status(200).send("User Name not found");
        }
        console.log("User Name Exists");
        return res.status(200).send("User Name Exists");
      }
    } catch (err) {
      console.log(err);
      res.status(500).send("Double Check 중 오류가 발생했습니다.");
    }
  },

  searchId: async (req, res) => {
    try {
      const phoneNumber = req.params.phoneNumber;
      if (!phoneNumber)
        return res.send("사용자의 Phone Number을 제공해야 합니다.").status(400);

      const result = await userModel.searchUser(phoneNumber);

      if (result.length === 0) {
        res.status(404).send("User not found");
        return;
      }
      return res.status(200).json({
        userId: result.user_id,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("ID 검색 중 오류가 발생했습니다.");
    }
  },

  changePassword: async (req, res) => {
    try {
      const { userId, userPassword } = req.body;
      const hashedPassword = await bcrypt.hash(userPassword, 10);

      if (!userId)
        return res.send("사용자의 Id를 제공해야 합니다.").status(400);

      await userModel.changePassword(userId, hashedPassword);
      if (result.length === 0) {
        res.status(404).send("User not found");
        return;
      }
      return res.status(200).send("Password Change successfully");
    } catch (err) {
      console.log(err);
      res.status(500).send("비밀번호 변경 중 오류가 발생했습니다.");
    }
  },

  createProfile: async (req, res) => {
    try {
      const { userId, userName, phoneNumber, Gender, Age } = req.body;
      try {
        let userImage = null;
        if (req.file) userImage = req.file.path;

        await userModel.createProfile(
          userId,
          userName,
          phoneNumber,
          Gender,
          Age,
          userImage
        );

        res.status(201).send("Profile added successfully");
      } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);
        return res.status(500).json({
          resultCode: 500,
          resultMsg:
            "이미지를 Cloudinary에 업로드하는 도중 오류가 발생했습니다.",
          error: error.message,
        });
      }
    } catch (err) {
      console.log(err);
      res.status(500).send("프로필 생성 중 오류가 발생했습니다.");
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { userId, userName } = req.body;
      try {
        let userImage = null;
        if (req.file) userImage = req.file.path;

        await userModel.updateProfile(userId, userName, userImage);

        res.status(201).send("Profile added successfully");
      } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);
        return res.status(500).json({
          resultCode: 500,
          resultMsg:
            "이미지를 Cloudinary에 업로드하는 도중 오류가 발생했습니다.",
          error: error.message,
        });
      }
    } catch (err) {
      console.log(err);
      res.status(500).send("프로필 생성 중 오류가 발생했습니다.");
    }
  },

  createInquiry: async (req, res) => {
    const { userName, categoryId, title, content } = req.body;

    await userModel.createInquiry(userName, categoryId, title, content);

    try {
      res.status(201).send("Inquiry added successfully");
    } catch (err) {
      console.log(err);
      res.status(500).send("문의 생성 중 오류가 발생했습니다.");
    }
  },

  searchInquiry: async (req, res) => {
    const userName = req.params.userName;

    if (!userName) {
      return res.status(400).json({
        resultCode: 400,
        resultMsg: "사용자 Name을 제공해야 합니다.",
      });
    }

    const result = await userModel.searchInquiry(userName);

    try {
      if (result.length === 0) {
        res.status(404).send("User not found");
        return;
      }

      return res.status(200).json({
        inquiryId: result.inquiry_id,
        userName: result.user_name,
        categoryId: result.category_id,
        title: result.title,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("문의 검색 중 오류가 발생했습니다.");
    }
  },

  selectInquiry: async (req, res) => {
    const inquiryId = req.params.inquiryId;

    if (!inquiryId) {
      return res.status(400).json({
        resultCode: 400,
        resultMsg: "문의 Id를 제공해야합니다.",
      });
    }
    const result = await userModel.searchInquiry(userName);

    try {
      if (result.length === 0) {
        res.status(404).send("User not found");
        return;
      }

      return res.status(200).json({
        inquiryId: result.inquiry_id,
        userName: result.user_name,
        categoryId: result.category_id,
        title: result.title,
        content: result.content,
        writeDate: result.write_date,
        answerStatus: result.status,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("문의 내역을 가져오는 중 오류가 발생했습니다.");
    }
  },

  searchAnswer: async (req, res) => {
    const inquiryId = req.params.inquiryId;
    if (!inquiryId) {
      return res.status(400).json({
        resultCode: 400,
        resultMsg: "문의 Id를 제공해야합니다.",
      });
    }
    const result = await userModel.searchAnswer(inquiryId);
    try {
      if (result.length === 0) {
        res.status(404).send("User not found");
        return;
      }

      return res.status(200).json({
        answerId: result.answer_id,
        inquiryId: result.inquiry_id,
        userName: result.user_name,
        content: result.content,
        writeDate: result.write_date,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("문의 내역을 가져오는 중 오류가 발생했습니다.");
    }
  },
};

module.exports = {
  signController: signController,
  authController: authController,
  userController: userController,
};
