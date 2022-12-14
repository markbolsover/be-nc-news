const db = require('../db/connection.js');

exports.selectArticles = (topic) => {
    let topics = [];
    let articleTopics = [];
    return db
        .query(`SELECT slug FROM topics;`)
        .then((result) => {
            result.rows.forEach((topicFromTopicsTable) => {
                topics.push(topicFromTopicsTable.slug)
            });
        })
        .then(() => {
            return db
                .query(`SELECT topic FROM articles;`)
        })
        .then((result) => {
            result.rows.forEach((article) => {
                articleTopics.push(article.topic);
            });
        })
        .then(() => {
            if (!topics.includes(topic) && topic != undefined) {
                return Promise.reject({ status: 404, msg: 'topic not found' });
            };
        })
        .then(() => {
            if (articleTopics.includes(topic) || topic === undefined) {
                let queryStr = `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, 
                                CAST(COUNT(comments.*) AS int) AS comment_count FROM articles
                                LEFT JOIN comments ON comments.article_id = articles.article_id`;
                const queryValues = [];
                if (topic) {
                    queryStr += ` WHERE topic = $1`;
                    queryValues.push(topic);
                };
                queryStr += ` GROUP BY articles.article_id
                            ORDER BY articles.created_at DESC;`;
                return db
                    .query(queryStr, queryValues);
            } else {
                return [];
            };
        })
        .then((result) => {
            if (articleTopics.includes(topic) || topic === undefined) {
                return result.rows;
            } else {
                return result;
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

exports.selectCommentsByArticleId = (articleId) => {
    let articlesWithComments = [];
    let articleIdsFromArticles = [];
    return db
        .query(`SELECT article_id 
                FROM comments;`)
        .then((result) => {
            result.rows.forEach((comment) => {
                articlesWithComments.push(comment.article_id);
            });
        })
        .then(() => {
            return db
                .query(`SELECT article_id
                    FROM articles;`);
        })
        .then((result) => {
            result.rows.forEach((article) => {
                articleIdsFromArticles.push(article.article_id);
            });
        })
        .then(() => {
            const articleIdAsNumber = Number(articleId);
            if (!articlesWithComments.includes(articleIdAsNumber) && articleIdsFromArticles.includes(articleIdAsNumber)) {
                return Promise.reject({ status: 404, msg: 'the selected article does not have any comments' });
            };
        })
        .then(() => {
            return db
                .query(`SELECT comment_id, votes, created_at, author, body 
                    FROM comments 
                    WHERE article_id = $1;`, [articleId]);
        })
        .then((result) => {
            if (result.rows.length === 0) {
                return Promise.reject({ status: 404, msg: 'article not found' });
            } else {
                return result.rows;
            };
        });
};

exports.insertComment = (articleId, commentUsername, commentBody) => {
    let articleIdsFromArticles = [];
    const articleIdAsNumber = Number(articleId);
    return db
        .query(`SELECT article_id
                FROM articles;`)
        .then((result) => {
            result.rows.forEach((article) => {
                articleIdsFromArticles.push(article.article_id);
            });
        })
        .then(() => {
            if (!articleIdsFromArticles.includes(articleIdAsNumber)) {
                return Promise.reject({ status: 404, msg: 'article not found' });
            } else if (commentUsername === undefined || commentBody === undefined || typeof commentUsername !== 'string' || typeof commentBody !== 'string') {
                return Promise.reject({ status: 400, msg: 'bad request' });
            };
        })
        .then(() => {
            return db
                .query(`INSERT INTO comments (body, author, article_id)
                        VALUES ($1, $2, $3)
                        RETURNING *;`, [commentBody, commentUsername, articleIdAsNumber])
        })
        .then((result) => {
            return result.rows[0];
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
