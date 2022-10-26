const express = require("express");
const apiRouter = require("./routes/api-router");
const { invalidRequest } = require("./controllers/errors.controller.js");

const app = express();

app.use(express.json());
app.use("/api", apiRouter);
app.all("/*", invalidRequest);

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "bad request" });
  } else if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    console.log(err, "<<<<<<<<< error");
    res.status(500).send({ msg: "internal server error" });
  }
});

module.exports = app;
