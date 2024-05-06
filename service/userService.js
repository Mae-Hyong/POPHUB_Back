const bcrypt = require("bcrypt");

const db = require('../config/mysqlDatabase');

const sendMessage = require('../function/message');
const generateToken = require('../function/jwt');

// ------- GET Query -------
const user_search_query = 'SELECT * FROM user_info WHERE user_id = ?';
const name_search_query = 'SELECT * FROM user_info WHERE user_name = ? OR user_id = ?';
const inquiry_search_query = 'SELECT * FROM inquiry WHERE user_name = ?';
const id_search_query = 'SELECT user_id From user_info WHERE phone_number = ?';

// ------- POST Query -------certification
const sign_in_query = 'SELECT * FROM user_join_info WHERE user_id = ?';
const sign_up_query = 'INSERT INTO user_join_info (user_id, user_password, user_role) VALUES (?, ?, ?)';
const password_change_query = 'UPDATE user_join_info SET user_password = ? WHERE user_id = ?';
const user_add_query = 'INSERT INTO user_info (user_id, user_name, phone_number, gender, age, user_image) VALUES (?, ?, ?, ?, ?, ?)';
const profile_change_query = 'UPDATE user_info SET user_name, user_image  WHERE user_id = ?';
const inquiry_add_query = 'INSERT INTO inquiry (user_name, category_id, title, content) VALUES (?, ?, ?, ?)';


// ------- GET Service -------
const certification = async (req, res) => {
  const phoneNumber = req.body.phoneNumber;
  const Number = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
  
  sendMessage(phoneNumber, Number);
  
  res.send(phoneNumber, Number);
};

// SMS 인증 번호 확인
const verifyCertification = async (req, res) => {
  const { authCode, expectedCode } = req.body;

  if ( authCode === expectedCode ) res.status(200).send('Successful !');
  else res.status(401).send('Failed. Invalid code.');

};

// 유저 프로필 조회
const userDataSearch = async (req, res) => {
  const userId = req.body.userId;

  // 아이디가 안담겨 왔을때
  if (!userId) {
    return res.status(400).json({
        resultCode: 400,
        resultMsg: "사용자 ID를 제공해야 합니다.",
    });
  }
  
  db.query(user_search_query, [userId], async (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }
    
    if (result.length === 0) {
      res.status(404).send('User not found');
      return;
    }
    return res.status(200).json({
      userId : result[0].user_id,
      userName : result[0].user_name,
      phoneNumber : result[0].phone_number,
      pointScore : result[0].point_score,
      gender : result[0].gender,
      age : result[0].age,
      userImage : result[0].user_image,
    })
  });
};

// 유저 ID 혹은 Name 중복 체크
const userDoubleCheck = async (req, res) => {
  const userId = req.body.userId;
  const userName = req.body.userName;

  // 아이디 혹은 유저 네임이 안담겨 왔을때
  if (!userId && !userName) {
    return res.status(400).json({
        resultCode: 400,
        resultMsg: "사용자 userName 혹은 Id를 제공해야 합니다.",
    });
  }
  
  db.query(name_search_query, [userId, userName], async (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }
    
    if (userId){
      if(result.length === 0) {
        return res.status(200).send('User ID not found');
        
      }
      return res.status(200).send('User ID Exists');
    } else {
      if(result.length === 0) {
        console.log('User Name not found');
        return res.status(200).send('User Name not found');
      }
      console.log('User Name Exists');
      return res.status(200).send('User Name Exists');
    }
    
    })
};

const idSearch = async (req, res) => {
  const phoneNumber = req.body.phoneNumber;

  if(!phoneNumber) return res.send('사용자의 Phone Number을 제공해야 합니다.').status(400)

  db.query(id_search_query, [phoneNumber], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }
    
    if (result.length === 0) {
      res.status(404).send('User not found');
      return;
    }
    return res.status(200).json({
      userId : result[0].user_id
    })
  })
};

const inquiryDataSearch = async (req, res) => {
  const userName = req.body.userName;

  if (!userName) {
    return res.status(400).json({
        resultCode: 400,
        resultMsg: "사용자 Name을 제공해야 합니다.",
    });
  }

  db.query(inquiry_search_query, [userName], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }
    
    if (result.length === 0) {
      res.status(404).send('User not found');
      return;
    }
    return res.status(200).json({
      inquiryId : result[0].inquiry_id,
      userName : result[0].user_name,
      categoryId : result[0].category_id,
      title : result[0].title,
      content : result[0].content,
    })
  });
};

// ------- POST Service -------

const signUp = async (req, res) =>{
  const { userId, userPassword, userRole } = req.body;
  const hashedPassword = await bcrypt.hash(userPassword, 10);
  
  db.query(sign_up_query, [ userId, hashedPassword, userRole ], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }
  
    console.log('User added:', result);
    res.status(201).send('User added successfully');
  });
};

const signIn = async (req, res) => {
  const { userId, userPassword } = req.body;
  
  db.query(sign_in_query, [userId], async (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }
    
    if (result.length === 0) {
      res.status(404).send('User not found');
      return;
    }

    const isPasswordValid = await bcrypt.compare(userPassword, result[0].user_password);
  
    if (isPasswordValid) {
      const token = generateToken(userId);
      return res.status(200).json({user_id : result[0].user_id, token });
    } else {
      res.status(401).send('Invalid password');
    }
  });
};

const passwordChange = async (req, res) => {
  const {userId, userPassword} = req.body;
  const hashedPassword = await bcrypt.hash(userPassword, 10);

  if(!userId) return res.send('사용자의 Id를 제공해야 합니다.').status(400)

  db.query(password_change_query, [hashedPassword, userId], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }
    
    if (result.length === 0) {
      res.status(404).send('User not found');
      return;
    }
    return res.status(200).send('Password Change successfully');
  })
};

const userDataAdded = async (req, res) => {
  const { userId, userName, phoneNumber, Gender, Age } = req.body;

  try {
    let userImage = null;
    if (req.file) {
      userImage = req.file.path;
    }

    db.query(user_add_query, [ userId, userName, phoneNumber, Gender, Age, userImage ], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
        return;
      }
      
      res.status(201).send('User added successfully');
    })
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    return res.status(500).json({
        resultCode: 500,
        resultMsg: "이미지를 Cloudinary에 업로드하는 도중 오류가 발생했습니다.",
        error: error.message
    });
  }
};

const profileUpdate = async (req, res) => {
  const { userId, userName } = req.body;

  try {
    let userImage = null;
    if (req.file) {
      userImage = req.file.path;
    }

    db.query(profile_change_query, [userName, userImage, userId], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
        return;
      }
      
      res.status(200).send('Profile Update successfully');
    })
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    return res.status(500).json({
        resultCode: 500,
        resultMsg: "이미지를 Cloudinary에 업로드하는 도중 오류가 발생했습니다.",
        error: error.message
    });
  }
};

const inquiryDataAdded = async (req, res) => {
  const { userName, categoryId, title, content } = req.body;

  db.query(inquiry_add_query, [userName, categoryId, title, content], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }
  
    console.log('Inquiry added:', result);
    res.status(201).send('Inquiry added successfully');
  });
};


// ------- Module Exports -------
module.exports = {
  // GET
  certification : certification,
  verifyCertification : verifyCertification,
  userDataSearch : userDataSearch,
  userDoubleCheck : userDoubleCheck,
  idSearch : idSearch,
  inquiryDataSearch : inquiryDataSearch,

  // POST
  signUp : signUp,
  signIn : signIn,
  passwordChange : passwordChange,
  userDataAdd : userDataAdded,
  profileUpdate : profileUpdate,
  inquiryDataAdded : inquiryDataAdded,
}