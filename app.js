const express = require('express');
const { getTopics } = require('./controllers/topics.controllers.js');
const { errorHandler } = require('./error-handling.js');

const app = express();

app.get('/api/topics', getTopics);
app.all('/*', errorHandler);

app.use((err, req, res, next) => {
    if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg });
    }
    else {
        console.log(err, '<<<<<<<<< error');
        res.status(500).send({ msg: 'internal server error' });
    }
});

module.exports = app;