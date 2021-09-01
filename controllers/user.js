const User = require('../Models/user')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/AppError')
const _ = require('lodash')
const multer = require('multer')
const sharp = require('sharp')

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users')
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1]
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//     }
// })

// Store as a buffer
// file.fileName will not be set
const multerStorage = multer.memoryStorage()

// Filtering what kind of file is permitted
const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(new AppError(400, 'Not an image. Please upload image only.'), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

// The middleware that will be run
exports.uploadUserPhoto = upload.single('photo')

// Resize middle from SHARP
exports.resizePhoto = catchAsync(async (req, res, next) => {
    if(!req.file) return next()

    // Setting the fileName
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`)

    next()
})

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
    // // Create error if user POSTs password data
    // if (req.body.password || req.body.passwordConfirm) return next(
    //     new AppError(400, 'This route is not for updating password.')
    // )

    // Only allowed fields
    const updates = _.pick(req.body, ['name', 'email'])

    // Multer middleware
    if(req.file) {
        updates.photo = req.file.filename
    }
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
    await User.findByIdAndUpdate(req.user._id, {
        active: false
    })

    res.status(204).json({
        status: 'success',
        data: null
    })
})