const articlesRouter = require("express").Router();
const {
  getArticles,
  getArticleByID,
  getCommentsByArticleId,
  addComment,
  editVotes,
} = require("../controllers/articles.controller.js");

articlesRouter.route("/").get(getArticles);
articlesRouter.route("/:article_id").get(getArticleByID).patch(editVotes);
articlesRouter
  .route("/:article_id/comments")
  .get(getCommentsByArticleId)
  .post(addComment);
articlesRouter.route("/:article_id/comments").get(getCommentsByArticleId);

module.exports = articlesRouter;
