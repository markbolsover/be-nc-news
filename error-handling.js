exports.errorHandler = (req, res, next) => {
    res.status(404).send({ msg: 'route not found' });
};