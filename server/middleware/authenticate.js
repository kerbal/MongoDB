const { User } = require('../models/user');

const authenticate = async (req, res, next) => {
  const token = req.header('x-auth');
  try {
    const user = await User.findByToken(token);
    if(user) {
      res.status(200);
      req.user = user;
      req.token = token;
      next();
    }
    else {
      res.sendStatus(401);
    }
  }
  catch(error) {
    res.sendStatus(400);
  }
}

module.exports = {
  authenticate
}