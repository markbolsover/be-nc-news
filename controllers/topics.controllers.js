const { selectTopics } = require('../models/topics.models.js');

exports.getTopics = (req, res, next) => {
    selectTopics()
        .then((topicsArray) => {
            res
                .status(200)
                .send({ topics: topicsArray });
        })
        .catch((err) => {
            next(err);
        });
};
