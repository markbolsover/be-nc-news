const { selectArticle, updateVotes } = require('../models/articles.model.js');

exports.getArticleByID = (req, res, next) => {
    const articleId = req.params.article_id;
    selectArticle(articleId)
        .then((articleData) => {
            res.status(200).send({ article: articleData });
        })
        .catch((err) => {
            next(err);
        });
};

exports.editVotes = (req, res, next) => {
    const articleId = req.params.article_id;
    const votes = req.body.inc_votes;
    updateVotes(articleId, votes).then((articleData) => {
        res.status(201).send({ article: articleData });
    })
        .catch((err) => {
            next(err);
        });
};