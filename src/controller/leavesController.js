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
            { $match: { status: "PENDING" } },
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

leavesController.emlpoleaveslist = async (req, res) => {

    sess = req.session;


    const user_id = sess.userData._id
    const LeavesData = await Leaves.find({ user_id: user_id });
    // console.log("user", LeavesData);
    try {
        const allLeaves = await Leaves.aggregate([
            { $match: { status: "PENDING" } },

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
        // console.log(allLeaves);


        res.render('emlpoleaveslist', {
            data: allLeaves, LeavesData: LeavesData, name: sess.name, username: sess.username, users: sess.userData
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

};
leavesController.cancelleaves = async (req, res) => {
    const _id = req.params.id;
    const user_id = sess.userData._id
    const updateLeaves = {
        status: "CANCELLED",
        approver_id: user_id,
    };

    const updateEmployee = await Leaves.findByIdAndUpdate(_id, updateLeaves);
    res.redirect("/viewleaves");
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





module.exports = leavesController;
