const mongoose = require('mongoose');

const passwordResetCodeSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    code: { type: Number, required: true },
    expiryDate: { type: Date, required: true },
    used: { type: Boolean, default: false }, // Trạng thái mã đã được sử dụng chưa
  },
  { timestamps: true }
);

const PasswordResetCode = mongoose.model('PasswordResetCode', passwordResetCodeSchema);

module.exports = PasswordResetCode;
