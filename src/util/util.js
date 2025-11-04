const crypto = require('crypto');
const JWT = require('jsonwebtoken');
const Config = require('../config/config');

function generatPasswordeHash(password, salt = null) {
    try {
        if (!salt) salt = crypto.randomBytes(16);
        salt = salt.toString('base64');
        const hash = crypto.createHmac('sha512', salt);
        hash.update(password);
        const value = hash.digest('hex');
        return {
            salt: salt,
            hash: value
        };

    } catch (error) {
        console.error(`Error in generatPasswordeHash`, error);
    }
}

function customsAuthTokens(payLoad = {}) {
    const secret = Config.jwt.user.secret
    const access_token = JWT.sign(payLoad, secret, { expiresIn: Config.jwt.accessTokenExpiresIn, issuer: Config.jwt.issuer });
    const refresh_token = JWT.sign(payLoad, secret, { expiresIn: Config.jwt.refreshTokenExpiresIn, issuer: Config.jwt.issuer });
    const accessTokenDecoded = JWT.decode(access_token);

    return ({
        accessToken: access_token,
        refreshToken: refresh_token,
        expirationTime: accessTokenDecoded['exp']
    });
}

function refreshToken(payLoad = {}, refreshToken = "") {
    const secret = Config.jwt.user.secret
    const access_token = JWT.sign(payLoad, secret, { expiresIn: Config.jwt.accessTokenExpiresIn, issuer: Config.jwt.issuer });
    const accessTokenDecoded = JWT.decode(access_token);

    return ({
        accessToken: access_token,
        refreshToken: refreshToken,
        expirationTime: accessTokenDecoded['exp']
    });
}

function verifyPassword({ hash, salt, password }) {
    if (hash && salt) {
        const passwordDetails = generatPasswordeHash(password, salt);
        if (hash !== passwordDetails.hash) {
            return false
        }
        return true;
    }
    return false
}

function responseFormate(userData, withToken = true) {
    const response = {
        uid: userData._id,
        email: userData.email,
        countryCode: userData.countryCode,
        phoneNumber: userData.phoneNumber,
        name: userData.name,
        address: userData.address ?? {},
        emoji: userData.emoji
    }
    if (withToken) response.authToken = customsAuthTokens({ uid: userData._id })
    return response;
}

function courseResponseFormate(courseData) {
    const response = {
        courseId: courseData._id,
        name: courseData.name,
        price: courseData.price
    }
    return response;
}

function generateOTP(signUpData) {
    const now = new Date();
    let otp = signUpData?.otp;
    const lastUpdated = signUpData?.updatedAt ? new Date(signUpData.updatedAt) : null;

    const timeDiffInMs = lastUpdated ? now.getTime() - lastUpdated.getTime() : Infinity;
    const timeDiffInMinutes = timeDiffInMs / (1000 * 60);

    if (!otp || timeDiffInMinutes >= 5) {
        otp = Math.floor(100000 + Math.random() * 900000); // Generate new 6-digit OTP
    }

    return {
        otp,
        updatedAt: now
    };
}


async function httpcall(method, data, url) {
    try {

        const options = {
            method: method ?? 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        };

        console.log(":::::", JSON.stringify(data));
        const response = await fetch(`${url}`, options);

        if (!response.ok && !response.statusText.Ok) {
            const data = await response.json()
            console.log("Erros", data)
            throw new Error(data.message || 'Failed to fetch data.');
        }
        const responseData = await response.json()
        return responseData;
    } catch (error) {
        console.log(error);
        throw error
    }
};

function dateFormat(mongoDate) {
    const date = mongoDate ? new Date(mongoDate) : new Date();

    const formatted = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(date);

    return formatted;
}

function roundResultResponseFormat(roundData) {
    if (Array.isArray(roundData)) {
        return roundData.map(round => ({
            roundNumber: round.roundNumber,
            date: round.date,
            winningColor: round.winningColor,
            timestamp: round.timestamp,
            totalBets: round.totalBets || 0,
            totalAmount: round.totalAmount || 0,
            winnersCount: round.winnersCount || 0,
            totalPayout: round.totalPayout || 0
        }));
    }
    
    return {
        roundNumber: roundData.roundNumber,
        date: roundData.date,
        winningColor: roundData.winningColor,
        timestamp: roundData.timestamp,
        totalBets: roundData.totalBets || 0,
        totalAmount: roundData.totalAmount || 0,
        winnersCount: roundData.winnersCount || 0,
        totalPayout: roundData.totalPayout || 0
    };
}

module.exports = {
    generatPasswordeHash,
    responseFormate,
    verifyPassword,
    generateOTP,
    httpcall,
    courseResponseFormate,
    refreshToken,
    dateFormat,
    roundResultResponseFormat,
}