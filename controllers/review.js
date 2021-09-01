const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/AppError')
const Review = require('../Models/Review')

exports.createReview = catchAsync(async (req, res, next) => {
    const review = await Review.create({
        ...req.body,
        createdAt: Date.now(),
        tour: req.params.id,
        user: req.user._id
    })

    res.status(201).json({
        status: 'success',
        data: {
            review
        }
    })
})

exports.updateReview = catchAsync(async (req, res, next) => {
    const update = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    if(!update) return next(new AppError(404, 'No review found with that Id'))

    res.status(200).json({
        status: 'success',
        data: {
            review: update
        }
    })
})

exports.getTour = catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.id)

    if(!review) return next(new AppError(404, 'No review found with that Id'))

    res.status(200).json({
        status: 'success',
        data: {
            review
        }
    })
})

exports.getReviews = catchAsync(async (req, res, next) => {
    let filter = {}

    if(req.params.id) filter = { tour: req.params.id }

    const reviews = await Review.find(filter)

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews
        }
    })
})

exports.deleteReview = catchAsync(async (req, res, next) => {
    const review = await Review.findByIdAndDelete(req.params.id)

    if(!review) return next(new AppError(404, 'No review found with that Id'))

    res.status(204).json({
        status: 'success',
        data: null
    })
})