const db = require('../db/connection.js');

exports.selectArticle = (articleId) => {
    return db
        .query(`SELECT * 
                FROM articles 
                WHERE article_id = $1;`, [articleId])
        .then((result) => {
            if (result.rows.length === 0) {
                return Promise.reject({ status: 404, msg: 'article not found' });
            } else {
                return result.rows[0];
            };
        });
};

exports.updateVotes = (articleId, votes) => {
    if (votes > 0) {
        return db
            .query(`UPDATE articles 
                    SET votes = votes + $1 
                    WHERE article_id = $2 
                    RETURNING *;`, [votes, articleId])
            .then((result) => {
                if (result.rows.length === 0) {
                    return Promise.reject({ status: 404, msg: 'article not found' });
                } else {
                    return result.rows[0];
                };
            });
    } else {
        const convertToPositive = Math.abs(votes);
        return db
            .query(`UPDATE articles 
                    SET votes = votes - $1 
                    WHERE article_id = $2 
                    RETURNING *;`, [convertToPositive, articleId])
            .then((result) => {
                if (result.rows.length === 0) {
                    return Promise.reject({ status: 404, msg: 'article not found' });
                } else {
                    return result.rows[0];
                };
            });
    };
};
