const bcrypt = require("bcrypt");

const db = require('./config/mysqlDatabase');

const sendMessage = require('../message');

// ------- GET Query -------


// ------- POST Query -------certification
const sign_in_query = 'SELECT * FROM user_join_info WHERE user_id = ?';
const sign_up_query = 'INSERT INTO user_join_info (user_id, user_password, user_role) VALUES (?, ?, ?)';
const certification_query = 'INSERT INTO certification (phone_number, certification) VALUES (?, ?)';
const user_data_query = 'INSERT INTO user_info (user_id, phone_number) VALUES (?, ?)';


// ------- GET Service -------


// ------- POST Service -------
const certification = async (req, res) => {
    const phoneNumber = req.body.phoneNumber;
    const Number = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");

    sendMessage(phoneNumber, Number);

    res.send(phoneNumber, Number);
};

const signUp = async (req, res) =>{
    const{ userId, userPassword, userRole, phoneNumber } = req.body;
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

    db.query(user)
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
        const token = jwt(userId);
        return res.status(200).json({ token });
      } else {
        res.status(401).send('Invalid password');
      }
    });
};

module.exports = {
    certification : certification,
    signUp : signUp,
    signIn : signIn,
}