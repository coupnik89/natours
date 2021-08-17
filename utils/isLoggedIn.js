const User = require('../Models/user')
const catchAsync = require('./catchAsync')

// Only for rendered pages, no ERRORS!

exports.isLoggedIn = catchAsync(async (req, res, next) => {
    if (req.cookies.jwt) {
        // 1) Verify the token in cookie
        const currentUser = await User.verifyToken(req.cookies.jwt)

        // 2) Check if user still exists
        if (!currentUser) {
            return next()
        }

        // 3) Check if user changed password after token was issued
        if (currentUser.isPwChangedAfterTknIssued(currentUser.JWTTimestamp)) {
            return next()
        }

        // There is a loggedIn user
        res.locals.user = currentUser
        return next()
    }

    next()
})