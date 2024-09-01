const multer = require("multer")
const logger = require("../logger")

exports.errorHandler = (err, req, res, next) => {
  logger.error("Error occurred:", err)

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File size exceeds the limit." })
    }
    return res.status(400).json({ error: "File upload error." })
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message })
  }

  res.status(500).json({ error: "Something went wrong!" })
}
