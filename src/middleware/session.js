const session = async (req, res, next) => {
    sess = req.session;
    // console.log(sess.userData);
    if (!(sess.userData)) {
        res.redirect('/')
    } else {
        next();
    }
}
module.exports = session;