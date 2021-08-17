const express = require('express')
const router = express.Router({
    mergeParams: true
})

const { authenticate, restrictTo } = require('../controllers/auth')

const reviewController = require('../controllers/review')

router.route('/')
    .get(reviewController.getReviews)
    .post(authenticate, restrictTo('user'), reviewController.createReview)

router.route('/:id')
    .get(reviewController.getTour)
    .patch(reviewController.updateReview)
    .delete(reviewController.deleteReview)

module.exports = router