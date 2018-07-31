const mongoose = require('mongoose');
const { link } = require('../../config');

mongoose.connect(link);

module.exports = {
  mongoose
}