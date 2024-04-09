const bcrypt = require("bcrypt");

const db = require('../config/mysqlDatabase');

const sendMessage = require('../message');
const generateToken = require('../jwt');

// ------- GET Query -------


// ------- POST Query -------certification
const sign_in_query = 'SELECT * FROM user_join_info WHERE user_id = ?';
const sign_up_query = 'INSERT INTO user_join_info (user_id, user_password, user_role) VALUES (?, ?, ?)';
const user_data_query = 'INSERT INTO user_info (user_id, user_name, phoner_number, gender, age, user_image) VALUES (?, ?, ?, ?, ?, ?)';


// ------- GET Service -------
const certification = async (req, res) => {
  const phoneNumber = req.body.phoneNumber;
  const Number = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
  
  sendMessage(phoneNumber, Number);
  
  res.send(phoneNumber, Number);
};

const user_data = async (req, res) => {
  const { userId, userName, phoneNumber, Gender, Age, userImage } = req.body;

  db.query(user_data_query, [ userId, userName, phoneNumber, Gender, Age, userImage ], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }
  
    console.log('User added:', result);
    res.status(201).send('User added successfully');
  })
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

module.exports = {
  // GET
  certification : certification,
  user_data : user_data,

  // POST
  signUp : signUp,
  signIn : signIn,
}