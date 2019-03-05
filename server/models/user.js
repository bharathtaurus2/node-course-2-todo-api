const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 1,
    trim: true,
  },
  email: {
    type: String,
    minlength: 1,
    trim: true,
    required: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tokens : [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

userSchema.methods.toJSON = function() {
  var user = this;
  var userObject = user.toObject();
  return _.pick(userObject, ['_id', 'email']);
}

userSchema.methods.generateAuthToken = function() {
  var user = this;
  var access = 'auth';
  var token  = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();
  user.tokens = user.tokens.concat([{access, token}]);
  return user.save().then(() => {
    return token;
  });
};

userSchema.pre('save', function(next) {
  var user = this;
  if(user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      if(err) {
        return Promise.reject(err);
      }
      bcrypt.hash(user.password, salt, (err, hash) => {
        if(err) {
          return Promise.reject(err);
        }
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.statics.findByToken = function(token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, 'abc123');
  } catch(e) {
    return Promise.reject();
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

userSchema.statics.findByCredentials = function(email, password) {
  var user = this;

  return user.findOne({email}).then(doc => {
    if (!doc) {
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, doc.password, (err, res) => {
        if(res) {
          resolve(doc);
        } else {
          reject();
        }
      });
    });
  })
};

var User = mongoose.model('User', userSchema);

module.exports = {User};
