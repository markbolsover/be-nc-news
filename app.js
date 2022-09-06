const express = require('express');
const { getTopics } = require('./controllers/topics.controller.js');
const { getArticleByID } = require('./controllers/articles.controller.js');
const { errorHandler } = require('./error-handling.js');

const app = express();

app.get('/api/topics', getTopics);
app.get('/api/articles/:article_id', getArticleByID);
app.all('/*', errorHandler);

app.use((err, req, res, next) => {
    if (err.code === '22P02') {
        res.status(400).send({ msg: 'bad request' });
    } else if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg });
    } else {
        console.log(err, '<<<<<<<<< error');
        res.status(500).send({ msg: 'internal server error' });
    };
});

module.exports = app;