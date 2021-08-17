const User = require('../Models/user')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/AppError')
const _ = require('lodash')

exports.getUsers = catchAsync(async (req, res, next) => {
    const users = await User.find()

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    })
})

exports.getUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id)

    res.status(200).json({
        status: 'success',
        data: user
    })
})

exports.getSelf = (req, res, next) => {
    req.params.id = req.user._id

    next()
} 

exports.updateSelf = catchAsync(async (req, res, next) => {
    // Create error if user POSTs password data
    if(req.body.password || req.body.passwordConfirm) return next(
        new AppError(400, 'This route is not for updating password.')
    )

    // Only allowed fields
    const updates = _.pick(req.body, ['name', 'email'])

    // Update user document
    const user = await User.findByIdAndUpdate(req.user.id, updates, {
        new: true,
        runValidators: true
    })
    
    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    })
})

exports.deleteSelf = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user._id, { active: false })

    res.status(204).json({
        status: 'success',
        data: null
    })
})