const User = require("../models/Users")
const bcrypt = require("bcrypt")
const { generalAccessToken, generalRefreshToken } = require("./JwtService")

/**
 * Authenticate and add new user account to the database
 * @param {*} newUser : information of the new user
 * @returns 
 */
const createUser = (newUser) => {
    return new Promise(async (resolve, reject) => {
        const { username, email, password } = newUser;

        try {
            if (!username) {
                return reject('username is required');
            }

            const existingUserByEmail = await User.findOne({ email });
            const existingUserByusername = await User.findOne({ username });

            if (existingUserByEmail) {
                return reject('The email is already in use');
            }
            if (existingUserByusername) {
                return reject('The username is already in use');
            }

            // Hash the password
            const hash = bcrypt.hashSync(password, 10);

            // Create the user in the database
            const newUser = await User.create({
                username,
                email,
                password: hash,
            });

            if (newUser) {
                resolve({
                    status: '200',
                    message: 'SUCCESS',
                    data: newUser,
                });
            } else {
                reject('Failed to create user');
            }
        } catch (e) {
            console.log("Error in createUser:", e); // Add this for debugging
            reject(e);
        }
    });
};


/**
 * Authenticate a user's credentials to log in
 * @param {*} userLogin : login credentials
 * @returns the user id and its tokens
 */
const loginUser = (userLogin) => {
    return new Promise(async (resolve, reject) => {
        const { email, password } = userLogin;
        try {
            const checkUser = await User.findOne({ email: email });

            if (checkUser === null) {
                reject('The user is not defined');
            }

            const comparePassword = bcrypt.compareSync(password, checkUser.password);
            if (!comparePassword) {
                reject('The password or username is incorrect');
            }

            const user_id = checkUser._id;
            const user_name = checkUser.username;
            const access_token = await generalAccessToken({ id: checkUser.id });
            const refresh_token = await generalRefreshToken({ id: checkUser.id });

            resolve({
                status: '200',
                message: 'SUCCESS',
                user_id,
                user_name,
                access_token,
                refresh_token,
            });
        } catch (e) {
            reject(e);
        }
    });
};

/**
 * Update information of a user
 * @param {*} id : id of the user
 * @param {*} data : information to be updated
 * @returns 
 */
const updateUser = (id, data)=>{
    return new Promise(async(resolve, reject)=>{
        try{
            const checkUser = await User.findOne({
                _id: id
            })
            if(checkUser === null){
                reject('The user is not defined');
            }
           const updatedUser = await User.findByIdAndUpdate(id, data, {new: true})
            resolve({
                status: 'OK',
                message: 'Update user success',
                data: updatedUser
            })
        }catch(e){
            reject(e)
        }
    })
}

/**
 * Get all information of a user
 * @param {*} id : id of the user
 * @returns 
 */
const getDetailsUser = (id)=>{
    return new Promise(async(resolve, reject)=>{
        try{
            const user = await User.findOne({
                _id: id
            })
            if(user === null){
                reject('The user is not defined');
            }
            resolve({
                status: '200',
                message: 'SUCCESS',
                data: user
            })
        }catch(e){
            reject(e)
        }
    })
}

const logoutUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Clear refresh_token for the user
            const user = await User.findByIdAndUpdate(userId, { refresh_token: null }, { new: true });
            if (!user) {
                return reject('User not found');
            }
            resolve({
                status: '200',
                message: 'User logged out successfully',  // Fixed duplicate message
            });
        } catch (e) {
            reject(e);
        }
    });
};


const updatePassword = ({ email, username, password }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findOne({ email, username });

            if (!user) {
                return reject('User not found with the provided email and username.');
            }

            // Hash the new password
            const hash = bcrypt.hashSync(password, 10);

            // Update the password
            user.password = hash;
            await user.save();

            resolve({
                status: 'OK',
                message: 'Password updated successfully',
            });
        } catch (e) {
            reject(e);
        }
    });
};


module.exports = {
    createUser,
    loginUser,
    updateUser,
    getDetailsUser,
    logoutUser,
    updatePassword
}