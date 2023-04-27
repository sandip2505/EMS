var session = async (req, res, next) => {
    // //console.log("headers", req.originalUrl);
    sess = req.session;
    sess.redirectUrl = req.originalUrl
    if (!(sess.userData)) {
        res.redirect('/login')
    } else {
        next();
    }
}
module.exports = session;