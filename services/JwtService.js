const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const generalAccessToken = async (payload) => {
    const access_token = jwt.sign(
        {
            payload,
        },
        process.env.ACCESS_TOKEN,
        { expiresIn: '1d' }
    );
    return access_token;
};

const generalRefreshToken = async (payload) => {
    const refresh_token = jwt.sign(
        {
            payload,
        },
        process.env.REFRESH_TOKEN,
        { expiresIn: '365d' }
    );
    return refresh_token;
};

const refreshTokenJwtService = (token) => {
    return new Promise((resolve, reject) => {
        if (!token) {
            return reject({
                status: 'ERROR',
                message: 'Token is required',
            });
        }

        jwt.verify(token, process.env.REFRESH_TOKEN, async (err, user) => {
            if (err) {
                return reject({
                    status: 'ERROR',
                    message: 'Invalid or expired refresh token',
                });
            }

            try {
                const { payload } = user;
                const access_token = await generalAccessToken({
                    id: payload?.id,
                });

                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    access_token,
                });
            } catch (e) {
                reject({
                    status: 'ERROR',
                    message: 'Failed to generate new access token',
                });
            }
        });
    });
};

module.exports = {
    generalAccessToken,
    generalRefreshToken,
    refreshTokenJwtService,
};
