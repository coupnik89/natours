const catchAsync = require('../utils/catchAsync')
const Tour = require('../Models/tour')
const AppError = require('../utils/AppError')

exports.getOverview = catchAsync(async (req, res, next) => {
    // Get tour data from collection
    const tours = await Tour.find()

    // Build the template

    // Render that template using tour data from 1
    res.status(200).render('overview', {
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

    if (!tour) return next(new AppError(404, 'Specified tour NOT found.'))

    res.status(200).set(
        'Content-Security-Policy',
        "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    ).render('tour', {
        title: `${tour.name} Tour`,
        tour
    })
})

exports.getLogin = catchAsync(async (req, res, next) => {
    res.status(200).set(
        'Content-Security-Policy',
        "default-src 'self' https://cdn.jsdelivr.net ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://cdn.jsdelivr.net 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    ).render('login', {
        title: 'Login into your account'
    })
})