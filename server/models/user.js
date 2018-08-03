const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const UserSchema = mongoose.Schema({
  email: {
    type: String,
    minlength: 1,
    required: true,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: 'Invalid Email'
    }
  },
  password: {
    type: String,
    minlength: 6,
    require: true,
    trim: true
  },
  tokens: [{
    access: {
      require: true,
      type: String
    },
    token: {
      require: true,
      type: String
    }
  }]
})

UserSchema.methods.generateAuthToken = async function () {
  const user = this;
  const access = 'auth';
  const token = jwt.sign({
    _id: user._id.toHexString(),
    access
  }, 'abc123').toString();
  user.tokens = user.tokens.concat([{access, token}]);

  await user.save();
  return token;
}

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  return {
    _id: userObject._id,
    email: userObject.email
  };
}

UserSchema.methods.removeToken = async function (token) {
  const user = this;
  await user.update({
    $pull: {
      tokens: {token} 
    }
  })
}

UserSchema.statics.findByToken = async function (token) {
  const User = this;
  try {
    const decode = await jwt.verify(token, 'abc123');
    const user = await User.findOne({
      _id: decode._id,
      'tokens.access': 'auth',
      'tokens.token': token
    })
    return user;
  }
  catch(error) {
    return null;
  }
}

UserSchema.pre('save', function(next) {
  const user = this;
  if(user.isModified('password')) {
    bcrypt.genSalt(10, (error, salt) => {
      bcrypt.hash(user.password, salt, (error, hash) => {
        user.password = hash;
        next();
      })
    })
  }
  else {
    next();
  }
})

const User = mongoose.model('User', UserSchema);

module.exports = {
  User
}