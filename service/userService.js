const bcrypt = require("bcrypt");

const db = require('../config/mysqlDatabase');

const sendMessage = require('../message');
const generateToken = require('../jwt');

// ------- GET Query -------
const user_search_query = 'SELECT * FROM user_info WHERE user_id = ?';

// ------- POST Query -------certification
const sign_in_query = 'SELECT * FROM user_join_info WHERE user_id = ?';
const sign_up_query = 'INSERT INTO user_join_info (user_id, user_password, user_role) VALUES (?, ?, ?)';
const user_add_query = 'INSERT INTO user_info (user_id, user_name, phoner_number, gender, age, user_image) VALUES (?, ?, ?, ?, ?, ?)';


// ------- GET Service -------
const certification = async (req, res) => {
  const phoneNumber = req.body.phoneNumber;
  const Number = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
  
  sendMessage(phoneNumber, Number);
  
  res.send(phoneNumber, Number);
};

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
    
      console.log('User added:', result);
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


module.exports = {
  // GET
  certification : certification,
  userDataSearch : userDataSearch,

  // POST
  signUp : signUp,
  signIn : signIn,
  userDataAdd : userDataAdded,
}