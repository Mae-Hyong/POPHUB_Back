const jwt = require('jsonwebtoken');
require('dotenv').config();

// JWT를 생성하는 함수
function generateToken(userId) {
  // 사용자 아이디를 기반으로 JWT를 생성합니다.
  const token = jwt.sign({ userId }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
  return token;
}

module.exports = generateToken; 