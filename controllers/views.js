const catchAsync = require('../utils/catchAsync')
const Tour = require('../Models/tour')
const AppError = require('../utils/AppError')

const User = require('../Models/user')

exports.getOverview = catchAsync(async (req, res, next) => {
    // Get tour data from collection
    const tours = await Tour.find()

    // Build the template

    // Render that template using tour data from 1
    res.status(200)
        .render('overview', {
            title: 'All tours',
            tours
        })
})

exports.getTourView = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({
        slug: req.params.slug
    }).populate({
        path: 'reviews',
        fields: 'review rating user'
    })

    if (!tour) return next(new AppError(404, 'Unable to find tour with that name.'))

    // .set(
    //         "Content-Security-Policy", "script-src-elem 'self' https://api.mapbox.com https://cdnjs.cloudflare.com"
    //     )

    res.status(200)
        .render('tour', {
        title: `${tour.name} Tour`,
        tour
    })
})

exports.getLogin = (req, res) => {
    res.status(200).render('login', {
        title: 'Login into your account'
    })
}

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'My account'
    })
}

exports.updateUserData = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email
    }, {
        new: true,
        runValidators: true
    })

    res.status(200).render('account', {
        title: 'My account',
        user: updatedUser
    })
})