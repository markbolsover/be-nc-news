const db = require('../db/connection.js');

exports.selectArticles = (topic) => {
    let queryStr = `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, 
                        CAST(COUNT(comments.*) AS int) AS comment_count FROM articles
                        LEFT JOIN comments ON comments.article_id = articles.article_id`;
    const queryValues = [];
    if (topic) {
        queryStr += ` WHERE topic = $1`;
        queryValues.push(topic);
    }
    queryStr += ` GROUP BY articles.article_id
                    ORDER BY articles.created_at DESC;`;
    return db
        .query(queryStr, queryValues)
        .then((result) => {
            if (result.rows.length === 0) {
                return Promise.reject({ status: 404, msg: 'topic not found' });
            } else {
                return result.rows;
            };
        });
};

exports.selectArticleById = (articleId) => {
    return db
        .query(`SELECT articles.*, CAST(COUNT(comments.*) AS int) AS comment_count FROM articles
                LEFT JOIN comments ON comments.article_id = articles.article_id
                WHERE articles.article_id = $1
                GROUP BY articles.article_id;`, [articleId])
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
