const session = async (req, res, next) => {
    sess = req.session;
    if (!(sess.userData)) {
        res.redirect('/')
    } else {
        next();
    }
}
module.exports = session;