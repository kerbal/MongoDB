const { SHA256 } = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/*
const message = 'abc123!';
const hash = SHA256(message).toString();
console.log(hash);

const data = {
  id: 10
}
const token = jwt.sign(data, 'abc123');
console.log(token);
*/

const password = 'abc123';

bcrypt.genSalt(10, (error, salt) => {
  bcrypt.hash(password, salt, (error, result) => {
    console.log(result);
  });
})