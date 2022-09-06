const { selectArticle } = require('../models/articles.model.js');

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