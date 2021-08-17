const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/AppError')


exports.deleteOne = (Model) => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id)

    if(!doc) return next(new AppError(404, 'No document found with that Id'))

    res.status(204).json({
        status: 'success',
        data: null
    })
})

exports.updateOne = (Model) => catchAsync(async (req, res, next) => {
    const id = req.params.id

    const doc = await Model.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
    })

    if(!doc) return next(new AppError(404, 'No document found with that Id'))

    // const docType = Model.type

    res.status(200).json({
        status: 'success',
        data: {
            'Model.type': doc
        }
    })
})