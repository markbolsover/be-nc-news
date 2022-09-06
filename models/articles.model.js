const db = require('../db/connection.js');

exports.selectArticle = (articleId) => {
    return db
        .query(`SELECT * FROM articles WHERE article_id = $1`, [articleId])
        .then((result) => {
            if (result.rows.length === 0) {
                return Promise.reject({ status: 404, msg: 'article not found' });
            } else {
                return result.rows[0];
            };
        });
};
