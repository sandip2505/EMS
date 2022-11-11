const Leaves = require("../model/leaves");
const leavesController = {};

leavesController.leaves = async (req, res) => {
    sess = req.session;
    try {
        res.render("leaves", {
            username: sess.username,
            users: sess.userData,
            layout: false,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// holidayController.getHoliday = async (req, res) => {
//     sess = req.session;

//     res.render("addHoliday", { username: sess.username });
// };

leavesController.addleaves = async (req, res) => {
    try {
        const addLeaves = new Leaves({
            user_id: req.body.user_id,
            datefrom: req.body.datefrom,
            dateto: req.body.dateto,
            reason: req.body.reason,
            // status: req.body.status,
        });
        // console.log(addLeaves);
        const Leavesadd = await addLeaves.save();
        res.status(201).redirect("/index");
    } catch (e) {
        res.status(400).send(e);
    }
};

leavesController.viewleaves = async (req, res) => {

    sess = req.session;
    try {
        const allLeaves = await Leaves.aggregate([
            { $match: { deleted_at: "null" } },
            {

                $lookup:
                {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "test"
                },

            },
            // {
            //     $lookup:
            //     {
            //         from: "users",
            //         localField: "user_id",
            //         foreignField: "_id",
            //         as: "test1"
            //     }
            // }

        ]);


        res.render('leaveslist', {
            data: allLeaves, name: sess.name, username: sess.username, users: sess.userData
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

};
leavesController.rejectleaves = async (req, res) => {
    const _id = req.params.id;
    const user_id = sess.userData._id
    const updateLeaves = {
        status: "REJECT",
        approver_id: user_id,
    };
    const updateEmployee = await Leaves.findByIdAndUpdate(_id, updateLeaves);
    res.redirect("/viewleaves");
};
leavesController.approveleaves = async (req, res) => {
    const _id = req.params.id;
    const user_id = sess.userData._id
    const updateLeaves = {
        status: "APPROVE",
        approver_id: user_id,
    };
    const updateEmployee = await Leaves.findByIdAndUpdate(_id, updateLeaves);
    res.redirect("/viewleaves");
};

// holidayController.editHoliday = async (req, res) => {
//     try {
//         sess = req.session;
//         const _id = req.params.id;
//         const holidayData = await Holiday.findById(_id);
//         res.render("editHoliday", {
//             data: holidayData,
//             username: sess.username,
//             layout: false,
//         });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// holidayController.updateHoliday = async (req, res) => {
//     try {

//         const _id = req.params.id;
//         const updateHoliday = {
//             holiday_name: req.body.holiday_name,
//             holiday_date: req.body.holiday_date,
//             updated_at: Date(),
//         };
//         const updateEmployee = await Holiday.findByIdAndUpdate(_id, updateHoliday);
//         res.redirect("/holidayListing");
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };



module.exports = leavesController;
