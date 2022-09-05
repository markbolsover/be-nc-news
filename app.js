const express = require('express');

const app = express();

app.use((err, req, res, next) => {
    console.log(err, '<<<<<<<< error');
    res.status(500).send({ msg: 'internal server error ' });
});

module.exports = app;