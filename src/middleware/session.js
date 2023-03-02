var session = async (req, res, next) => {
    sess = req.session;
    if (!(sess.userData)) {
        res.redirect('/login')
    } else {
        next();
    }
}
module.exports = session;