const mongoose = require('mongoose');

var User = mongoose.model('User', {
  name: {
    type: String,
    minlength: 1,
    trim: true,
  },
  email: {
    type: String,
    minlength: 1,
    trim: true,
    required: true
  }
});

module.exports = {User};
