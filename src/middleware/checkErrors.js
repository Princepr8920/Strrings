

module.exports = (err, req, res, next) => {
  console.error(err)
  res.status(err.status).end()
}




 