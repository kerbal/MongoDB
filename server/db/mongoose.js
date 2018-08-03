const mongoose = require('mongoose');
const { link } = require('../../config');

mongoose.connect(process.env.MOGODB_URI || link);

module.exports = {
  mongoose
}