const express = require('express');
const { getTopics } = require('./controllers/topics.controllers.js');

const app = express();

app.get('/api/topics', getTopics);

app.use((err, req, res, next) => {
    console.log(err, '<<<<<<<< error');
    res.status(500).send({ msg: 'internal server error ' });
});

module.exports = app;