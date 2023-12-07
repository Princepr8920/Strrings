module.exports = (err, req, res, next) => {
  console.error(err);

  if (
    typeof err !== "object" ||
    err?.status === 500 ||
    !err?.status ||
    !err?.message
  ) {
    let message = err?.message !== "" ? err?.message : "Something went wrong.";
    return res.status(500).json({ message, success: false });
  }

  return res.status(err.status).json(err);
};
