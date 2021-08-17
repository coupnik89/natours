const mongoose = require('mongoose')
const moment = require('moment')

const Tour = require('../Models/tour')

const reviewSchema = new mongoose.Schema({
    type: {
        type: String,
        default: 'review'
    },
    review: {
        type: String,
        trim: true,
        required: [true, 'Please write a review']
    },
    rating: {
        type: Number,
        required: [true, 'A review must have a rating'],
        min: [1, 'Rating must be between 1 and 5'],
        max: [5, 'Rating must be between 1 and 5']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must have be for a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must be from a user']
    }
}, {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
})

reviewSchema.virtual('timeStamp').get(function() {
    return moment().format('MMMM Do YYYY, h:mma')
})
 
reviewSchema.pre(/^find/g, function(next) {
    this.populate({
        path: 'user',
        select: 'id name photo'
    })

    next()
})

reviewSchema.methods.toJSON = function() {
    reviewObj = this.toObject()

    delete reviewObj.tour.durationWeeks

    return reviewObj
}

reviewSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                numRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ])

    await Tour.findByIdAndUpdate(tourId, {
        ratingsAverage: stats[0].avgRating,
        ratingsQuantity: stats[0].numRating
    })
}

reviewSchema.post('save', function() {
    this.constructor.calcAverageRatings(this.tour)

})

reviewSchema.post(/^findOneAnd/, async function(doc) {
  await doc.constructor.calcAverageRatings(doc.tour);
});

const Review = new mongoose.model('Review', reviewSchema)

module.exports = Review