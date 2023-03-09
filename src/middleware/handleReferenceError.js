function handleReferenceError(err, req, res, next) {
    if (err instanceof ReferenceError || TypeError) {
      res.status(500);
      console.error(err.message); 
      res.render('error', { message: 'Oops! Something went wrong.' });
    } else {
      next(err);
    }
  }
  module.exports = handleReferenceError;