const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')

// const User = require('./user')

const tourSchema = new mongoose.Schema({
    type: {
        type: String,
        default: 'tour'
    },
    name: {
        type: String,
        required: [true, 'Tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must have less or equal to 40 characters'],
        minlength: [10, 'A tour name must have more or equal to 10 characters']
    },
    duration: {
        type: Number,
        required: [true, 'Tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'Tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'Tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty must be EASY, MEDIUM or DIFFICULT'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 0
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'Tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                // THIS key word only work on NEW doc NOT updating a doc
                return val < this.price
            },
            message: 'Discount price $({VALUE}) must be lower than tour price'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'Tour must have a description']
    },
    description: {
        type: String,
        required: [true, 'Tour must have a description']
    },
    imageCover: {
        type: String,
        required: [true, 'Tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    startDates: [Date],
    slug: String,
    secretTour: Boolean,
    startLocation: {
        // GeoJSON {} with atleast 2 properties
        // Required
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        // Required
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
}, {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
})

tourSchema.index({ price: 1, ratingsAverage: -1 })
tourSchema.index({ slug: 1 })
tourSchema.index({ startLocation: '2dsphere' })

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7
})

// Virtual populate
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
})

tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name)

    next()
})

tourSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'guides',
        fields: 'name role photo'
    })

    next()
})

// tourSchema.pre('save', async function(next) {
//     const guidesPromises = this.guides.map(async (id) => await User.findById(id))

//     this.guides = await Promise.all(guidesPromises)
    
//     next()
// })

// // Runs before .save() & .create() | NOT .insertMany()
// tourSchema.pre('save', function(next) {
//     // Current processing doc
//     this.slug = slugify(this.name, {lower: true})

//     next()
// })

// tourSchema.post('save', function(doc, next) {
//     console.log(doc)

//     next()
// })

// Query middleware
// tourSchema.pre(/^find/, function(next) {
//     this.find({ secretTour: {$ne: true}})

//     next()
// })

// ************Aggregate Middleware
// tourSchema.pre('aggregate', function (next) {
//     this.pipeline().unshift({
//         $match: {
//             difficulty: {
//                 $ne: 'easy'
//             }
//         }
//     })
//     console.log(this.pipeline())
//     next()
// })

const Tour = new mongoose.model('Tour', tourSchema)

module.exports = Tour