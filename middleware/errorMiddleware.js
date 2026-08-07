function notFound(req, res) {
  res.status(404).json({ status: "fail", data: { message: "Endpoint not found." } });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  const statusCode = error.statusCode || error.status || (error.name === "MulterError" ? 400 : 500);
  if (statusCode >= 500) {
    return res.status(statusCode).json({ status: "error", message: "An unexpected server error occurred." });
  }
  return res.status(statusCode).json({ status: "fail", data: { message: error.message } });
}

module.exports = { notFound, errorHandler };
