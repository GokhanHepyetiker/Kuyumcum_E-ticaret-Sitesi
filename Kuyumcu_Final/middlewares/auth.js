const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        console.log('No token provided');
        return res.sendStatus(401);
    }

    jwt.verify(token, 'your_jwt_secret', (err, user) => {
        if (err) {
            console.log('Token verification failed', err);
            return res.sendStatus(403);
        }
        req.user = user.user;
        console.log('Token verified. ', user);
        next();
    });
}

module.exports = authenticateToken;
