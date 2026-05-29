export function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Not found - ${req.originalUrl}`));
}

export function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  if (error.name === "CastError") {
    return res.status(400).json({ message: "Invalid resource id" });
  }

  if (error.code === 11000) {
    const fields = Object.keys(error.keyPattern || {});
    return res.status(409).json({ message: `${fields.join(", ") || "Resource"} already exists` });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: Object.values(error.errors).map((item) => item.message)
    });
  }

  res.status(statusCode).json({
    message: error.message || "Server error"
  });
}
