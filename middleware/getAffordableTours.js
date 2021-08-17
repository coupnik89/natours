exports.getAffordableTours = (req, res, next) => {
    req.query.price = {lt: '1000'}
    req.query.sort = 'price'
    console.log(req.query)
    next()
}