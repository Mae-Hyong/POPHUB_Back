const db = require('./config/mysqlDatabase');
const express = require('express');
const app = express();

// ------- GET -------
const sign_in_query = 'SELECT * FROM user_join_info WHERE user_id = ?';

// ------- POST -------
const sign_up_query = 'INSERT INTO user_join_info (user_id, user_password, user_role) VALUES (?, ?, ?)';

app.post("/sign_up", async (req, res) =>{
    const{ userId, userPassword, userRole } = req.body;
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
});

app.post("/sign_in", async (req, res) => {
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
  });