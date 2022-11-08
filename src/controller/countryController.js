const country = require("../model/country");

const countryController = {}

countryController.countrylist = async (req, res) => {
    sess = req.session;
    try {
        const blogs = await country.find();
        res.render('', {
            data: blogs 
        });
        // res.json({ data: blogs, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

countryController.addcountrys = async (req, res) => {
    // res.send("asa")
    sess = req.session;
    res.render("addcountrys", { name: sess.name, users: sess.userData, username: sess.username, role: sess.role, layout: false });
}

// countryController.countrysadd = async (req, res) => {
//     // res.send("asa")
//     sess = req.session;
//     res.render("addcountrys", { name: sess.name, users: sess.userData, username: sess.username, role: sess.role, layout: false });
// }
countryController.countrysadd = async (req, res) => {

    try {
        const addcountry = new country({
            country: req.body.country,
        });
        const countryadd = await addcountry.save();
        res.status(201).redirect("/index");

    } catch (e) {
        res.status(400).send(e);
    }

}

// countryController.countrys = async (req, res) => {
//     sess = req.session;
//     try {
//         const blogs = await Role.find();
//         res.render('roleListing', {
//             data: blogs, name: sess.name, users: sess.userData, username: sess.username, role: sess.role, layout: false
//         });
//         // res.json({ data: blogs, status: "success" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
//     // res.render("holidayListing",{name:sess.name,layout:false});


// };

module.exports = countryController;