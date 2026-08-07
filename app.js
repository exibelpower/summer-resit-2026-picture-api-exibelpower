const express = require("express");
const routes = require("./routes/pictureRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
