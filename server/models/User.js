const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  savings_goal_pct: { type: Number, default: 10.0 },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
