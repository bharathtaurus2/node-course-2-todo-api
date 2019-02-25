const jwt = require('jsonwebtoken');


var data = {
  id: 10
};

var token = jwt.sign(data, 'abc123');
console.log(token);

var decoded = jwt.verify(token, 'abc123');
console.log(decoded);

// const {SHA256} = require('crypto-js');
//
// var message = 'abcd@1234.com'
//
// var hash = SHA256(message).toString();
//
// console.log('message:', message);
// console.log('hash', hash);
