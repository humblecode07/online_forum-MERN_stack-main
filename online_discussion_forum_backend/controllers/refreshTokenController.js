const User = require('../models/users');
const Instructor = require('../models/instructor')
const jwt = require('jsonwebtoken');

exports.handleRefreshToken = async (req, res) => {
    const authHeader = req.headers['authorization'];
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else {
        return res.sendStatus(401); 
    }

    const foundUser = await User.findOne({ refreshToken: token }).exec();
    const foundInstructor = await Instructor.findOne({ refreshToken: token }).exec();
    
    console.log(token)

    if (foundUser) {
        jwt.verify(
            token,
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
            token,
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