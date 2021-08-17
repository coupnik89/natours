const User = require('../Models/user')
const catchAsync = require('../utils/catchAsync')
const _ = require('lodash')
const AppError = require('../utils/AppError')

const sendEmail = require('../utils/email')
const setCookie = require('../utils/setCookie')

exports.signup = catchAsync(async (req, res, next) => {
    const allowInputs = _.pick(req.body, ['name', 'email', 'role', 'password', 'passwordConfirm', 'passwordChangedAt'])
    const newUser = await User.create(allowInputs)

    const token = newUser.generateAuthToken(process.env.JWT_EXPIRES)

    setCookie(res, token)

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    })
})

exports.login = catchAsync(async (req, res, next) => {
    const {
        email,
        password
    } = req.body

    if (!email || !password) return next(new AppError(400, 'Please provide email and password'))

    const user = await User.findByCredentials(email, password)

    if (!user) return next(new AppError(401, 'Incorrect email or password'))

    const token = user.generateAuthToken(process.env.JWT_EXPIRES)

    setCookie(res, token)

    res.status(200).json({
        status: 'success',
        token
    })
})

exports.authenticate = catchAsync(async (req, res, next) => {
    // 1) Get the token and check if it's there 
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt
    }

    if (!token) return next(new AppError(401, 'You are not authorized. Please login or signup to continue'))
    // 2) Verify the token 
    const currentUser = await User.verifyToken(token)

    // 3) Check if user still exists
    if (!currentUser) return next(new AppError(401, 'The user belonging to this token no longer exists'))

    // 4) Check if user changed password after token was issued
    if (currentUser.isPwChangedAfterTknIssued(currentUser.JWTTimestamp)) {
        return next(new AppError(401, 'The password was recently changed. Please log in again'))
    }

    // Grant access to protected route
    req.user = currentUser
    next()
})

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError(403, 'You do not have permission to perform this action'))
        }

        next()
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    if (!req.body.email) return next(new AppError(400, 'Please enter your email'))

    // Get user based on POSTed Email
    const user = await User.findOne({
        email: req.body.email
    })

    if (!user) return next(new AppError(404, 'No user found with that email'))

    // Generate the random reset token
    const resetToken = user.generateAuthToken()
    const pwResetTokenExpires = Date.now() + 10 * 60 * 1000
    user.passwordResetToken = resetToken
    user.passwordResetExpires = pwResetTokenExpires

    await user.save({
        validateBeforeSave: false
    })

    // Send a link to the user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`

    const message = `Forgot your password? Please follow the link to reset your password. ${resetURL}
    \n If you did not request to reset your password please disgard this email.
    `

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset: This link will be invalid after 10 minutes.',
            message
        })

        res.status(200).json({
            status: 'success',
            message: 'A link was sent to your email'
        })
    } catch (err) {
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined

        await user.save({
            validateBeforeSave: false
        })

        res.status(500).json({
            status: 'failed',
            error: err
        })

        // return next(new AppError(500, 'There was a problem sending the email. Please try again later.'))
    }
})

exports.resetPassword = catchAsync(async (req, res, next) => {
    const resetToken = req.params.token
    const isVerify = await User.verifyToken(resetToken)
    const user = await User.findOne({ _id: isVerify._id, passwordResetExpires: {
        $gt: Date.now()
    }})

    if(!user) return next(new AppError(400, 'Token is invalid ot has expired'))

    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined

    await user.save()

    console.log(user)

    const token = user.generateAuthToken()

    res.status(200).json({
        status: 'success',
        token
    })
})

exports.updatePassword = catchAsync(async (req, res, next) => {
    // Get user 
    const user = await User.findOne({ _id: req.user._id })

    // Check if posted pw is correct
    const isUser = await User.findByCredentials(user.email, req.body.password)

    if(!isUser) return next(new AppError(401, 'Incorrect crudentials'))
    
    // If so, update the pw
    user.password = req.body.newPassword
    user.passwordConfirm = req.body.newPasswordConfirm

    await user.save()

    const token = user.generateAuthToken()

    // Send Token
    res.status(200).json({
        status: 'success',
        token
    })
})