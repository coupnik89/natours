const fs = require('fs')
const path = require('path')
const Tour = require('../Models/tour')
const APIFeatures = require('../utils/APIFeatures')
const AppError = require('../utils/AppError')
const catchAsync = require('../utils/catchAsync')
const multer = require('multer')
const sharp = require('sharp')

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

const multerStorage = multer.memoryStorage()

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

// upload.single('photo') FROM middleware: req.file
// upload.array('images', 5) FROM middleware: req.files

// Mix
exports.uploadTourImages = upload.fields([
    {name: 'imageCover', maxCount: 1},
    {name: 'images', maxCount: 3}
])

exports.resizeTourImages = catchAsync(async (req, res, next) => {
    if(!req.files.imageCover || !req.files.images) return next()

    // 1) Processing cover image
    const imageCoverFileName = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${imageCoverFileName}`)

    req.body.imageCover = imageCoverFileName

    req.body.images = []

    await Promise.all(req.files.images.map(async (file, i) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`

        await sharp(file.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/tours/${filename}`)

        req.body.images.push(filename)
    }))

    // 2) Processing images in array

    next()
})

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