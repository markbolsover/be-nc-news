const topicsRouter = require("express").Router();
const { getTopics } = require("../controllers/topics.controller.js");

topicsRouter.route("/").get(getTopics);

module.exports = topicsRouter;
