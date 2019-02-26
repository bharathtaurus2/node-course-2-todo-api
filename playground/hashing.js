const jwt = require('jsonwebtoken');
//const bcrypt = require('bcryptjs');

var password = "abc123";

bcrypt.genSalt(10, (err, salt) => {
  bcrypt.hash(password, salt, (err, hash) => {
    console.log(hash);

  });
});

// var hash = '$2a$10$YacdJ0er4FBdTTuM4mh4FOIT8PlsMs6ILXefF1wLtvqWCddD1DXua'
var hash = '$2a$10$SQ9AtdB312Cx3QBT24540uHi/rQnIyErwlfzml3Z636hDtercrcSu'

bcrypt.compare(password, hash, (err, res) => {
  console.log(res);
});

// var data = {
//   id: 10
// };

// var token = jwt.sign(data, 'abc123');
// console.log(token);

// var decoded = jwt.verify(token, 'abc123');
// console.log(decoded);

// const {SHA256} = require('crypto-js');
//
// var message = 'abcd@1234.com'
//
// var hash = SHA256(message).toString();
//
// console.log('message:', message);
// console.log('hash', hash);


