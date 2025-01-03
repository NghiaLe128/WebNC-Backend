const mongoose = require('mongoose')
const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        avatar: { type: String }, 
        access_token: { type: String },
        refresh_token: { type: String }
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("Users", userSchema);
module.exports = User;
