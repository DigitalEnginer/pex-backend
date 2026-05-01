const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  walletBalance: {
    type: Number,
    default: 10000
  },
  holdings: [{
    ticker: {
      type: String,
      required: true
    },
    shares: {
      type: Number,
      required: true,
      default: 0
    }
  }]
});

module.exports = mongoose.model('User', userSchema);