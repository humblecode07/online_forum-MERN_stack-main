const User = require('../models/users');
const Instructor = require('../models/instructor')
const jwt = require('jsonwebtoken');

exports.handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    console.log('cookies', cookies?.jwt)
    if (!cookies?.jwt) return res.sendStatus(401);

    const refreshToken = cookies.jwt;

    const foundUser = await User.findOne({ refreshToken }).exec();
    const foundInstructor = await Instructor.findOne({ refreshToken }).exec();
    
    if (foundUser) {
        jwt.verify(
            refreshToken,
            process.env.REFRESH_JWT_KEY,
            (err, decoded) => {
                if (err || foundUser.email !== decoded.email) return res.sendStatus(403);
                const roles = Object.values(foundUser.role);
                const accessToken = jwt.sign(
                    {
                        "email": decoded.email,
                        "roles": roles,
                        "userId": decoded.userId
                    },
                    process.env.JWT_KEY,
                    { expiresIn: '2d' }
                );
                console.log('accessToken', accessToken)
                res.json({ accessToken })
            }
        );
    }
    else if (foundInstructor) {
        jwt.verify(
            refreshToken,
            process.env.REFRESH_JWT_KEY,
            (err, decoded) => {
                if (err || foundInstructor.email !== decoded.email) return res.sendStatus(403);
                const roles = Object.values(foundInstructor.role);
                const accessToken = jwt.sign(
                    {
                        "email": decoded.email,
                        "roles": roles,
                        "userId": decoded.userId
                    },
                    process.env.JWT_KEY,
                    { expiresIn: '2d' }
                );
                console.log('accessToken', accessToken)
                res.json({ accessToken })
            }
        );
    }
    else {
        console.log('man fuck this shti')
        return res.sendStatus(403); 
    }
}