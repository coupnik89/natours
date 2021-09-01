const express = require('express')
const router = express.Router()

const {
    test,
    getTour,
    getTours,
    createTour,
    updateTour,
    deleteTour,
    getStats,
    getToursWithin,
    getDistances,
    resizeTourImages,
    uploadTourImages
} = require('../controllers/tour')
const {
    getAffordableTours
} = require('../middleware/getAffordableTours')

const {
    authenticate,
    restrictTo
} = require('../controllers/auth')

const reviewRouter = require('./review')

router.use('/:id/reviews', reviewRouter)

router.get('/testing', test)

router.route('/distances/:latlng/unit/:unit')
    .get(getDistances)

router.route('/affordable-tours')
    .get(getAffordableTours, getTours)


router.route('/stats/:year')
    .get(getStats)

router.route('/')
    .get(authenticate, getTours)
    .post(authenticate, restrictTo('admin', 'lead-guide'), createTour)

router.route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(getToursWithin)

router.route('/:id')
    .get(getTour)
    .patch(
        authenticate, 
        restrictTo('admin', 'lead-guide'), 
        uploadTourImages,
        resizeTourImages,
        updateTour)
    .delete(authenticate, restrictTo('admin', 'lead-guide'), deleteTour)



module.exports = router