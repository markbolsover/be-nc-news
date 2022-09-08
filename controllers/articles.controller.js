const { selectArticles, selectArticleById, selectCommentsByArticleId, updateVotes } = require('../models/articles.model.js');

exports.getArticles = (req, res, next) => {
    const topic = req.query.topic;
    selectArticles(topic)
        .then((articleData) => {
            res.status(200).send({ articles: articleData });
        })
        .catch((err) => {
            next(err);
        });
};

exports.getArticleByID = (req, res, next) => {
    const articleId = req.params.article_id;
    selectArticleById(articleId)
        .then((articleData) => {
            res.status(200).send({ article: articleData });
        })
        .catch((err) => {
            next(err);
        });
};

exports.getCommentsByArticleId = (req, res, next) => {
    const articleId = req.params.article_id;
    selectCommentsByArticleId(articleId)
        .then((commentData) => {
            res.status(200).send({ comments: commentData });
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