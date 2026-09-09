// Middleware error terpusat, biar controller cukup panggil next(err)
function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Terjadi kesalahan pada server' });
}

module.exports = errorHandler;
