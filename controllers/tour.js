const fs = require('fs')
const path = require('path')
const Tour = require('../Models/tour')
const APIFeatures = require('../utils/APIFeatures')
const AppError = require('../utils/AppError')
const catchAsync = require('../utils/catchAsync')

const factory = require('../controllers/handlerFactory')

// exports.checkId = async (req, res, next, val) => {
//     console.log(`Tour id is: ${val}`);

//     const id = +req.params.id
//     const tour = await Tour.findById(id)

//     if (!tour) {
//         return res.status(401).json({
//             status: 'failed',
//             message: 'No tour found.'
//         })
//     }

//     next()
// }

exports.getStats = async (req, res, next) => {
    const year = req.params.year

    const stats = await Tour.aggregate([{
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: '$difficulty',
                numTours: {
                    $sum: 1
                },
                tours: {
                    $push: '$name'
                }
            }
        }
    ])

    res.status(200).json({
        status: 'success',
        results: stats.length,
        data: stats
    })
}

exports.test = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([{
            $match: {
                price: {
                    $gt: 1
                }
            }
        },
        {
            $group: {
                _id: '$difficulty',
                avgPrice: {
                    $avg: '$price'
                },
                numTours: {
                    $sum: 1
                },
                tours: {
                    $push: '$name'
                }
            }
        }
    ])

    res.status(200).json({
        status: 'success',
        results: stats.length,
        data: {
            stats
        }
    })
})

exports.getTours = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .fields()
        .pagination()
    // Execute the query
    // const tours = await features.query.explain()
    const tours = await features.query

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
    })
})

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id).populate('reviews')

    if (!tour) return next(new AppError(404, 'No tour found with that Id'))

    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })
})

exports.createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body)

    res.status(201).json({
        status: 'success',
        data: {
            tour: newTour
        }
    })
})

exports.updateTour = catchAsync(async (req, res, next) => {
    const id = req.params.id

    const tour = await Tour.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
    })

    if (!tour) return next(new AppError(404, 'No tour found with that Id'))

    res.status(200).json({
        status: 'success',
        data: {
            tour: tour
        }
    })
})

exports.deleteTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id)

    if (!tour) return next(new AppError(404, 'No tour found with that Id'))

    res.status(204).json({
        status: 'success',
        data: null
    })
})

// /tours-within/:distance/center/:latlng/unit/:unit
// Route e.g /tours-within/233/center/34.111745,-118.112288/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
    const {
        distance,
        latlng,
        unit
    } = req.params
    const [lat, lng] = latlng.split(',')

    if (!lat || !lng) return new AppError(400, 'Please provide latitude and longitude in format lat,lng')

    // MongoDB expect special unit radiant: distance / radius of the earth
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1

    const tours = await Tour.find({
        startLocation: {
            $geoWithin: {
                $centerSphere: [[lng, lat], radius]
            }
        }
    })

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }
    })
})

exports.getDistances = catchAsync(async (req, res, next) => {
    const {
        latlng,
        unit
    } = req.params
    const [lat, lng] = latlng.split(',')

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001 

    if (!lat || !lng) return new AppError(400, 'Please provide latitude and longitude in format lat,lng')

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                // Calc in meter
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ])

    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    })
})