const holiday = require("../../model/holiday");
const Helper = require("../../utils/helper");
const helper = new Helper();
const holidayApi = require("../../project_api/holiday");

const holidayController = {};
holidayController.holidaylist = async (req, res) => {
  sess = req.session;
  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "View Holidays")
    .then(async (rolePerm) => {
      console.log("rolePerm", rolePerm);
      if (rolePerm.status) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const year = parseInt(req.query.year) || new Date().getFullYear();

        const searchParams = {
          deleted_at: "null",
          ...(req.query.search && {
            holiday_name: {
              $regex: new RegExp(req.query.search, "i"),
            },
          }),
          ...(req.query.year && {
            holiday_date: {
              $gte: new Date(year, 0, 1),
              $lt: new Date(year + 1, 0, 1),
            },
          }),
        };

        // const sortParams = {
        //   ...(req.query.dateSort && {
        //     holiday_date: req.query.dateSort === "ASC" ? 1 : -1,
        //   }),
        // };

        const totalData = await holiday.countDocuments(searchParams);
        const totalPages = Math.ceil(totalData / limit);

        const holidayData = await holidayApi.holidays({
          searchParams,
          skip,
          limit,
        });

        const indexedHolidayData = holidayData.map((item, index) => ({
          index: skip + index + 1,
          ...item._doc,
        }));

        res.json({
          page,
          limit,
          totalPages,
          totalData,
          holidayData: indexedHolidayData,
        });
      } else {
        res.status(403).json({ status: false ,errors:'Permission denied' });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
holidayController.Holidayadd = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();

    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "Add Holiday"
    );

    if (rolePerm.status) {
      await holidayApi.addHoliday(req.body);
      res.status(201).json({ message: "Holiday Created Successfully" });
    } else {
      res.status(403).json({ status: false ,errors:'Permission denied' });
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      const errorMessages = Object.keys(error.errors).map(
        (key) => error.errors[key].message
      );
      res.status(400).json({ errors: errorMessages.join(", ") });
    } else if (error.name === "PermissionError") {
      res.status(403).json({ message: error.message });
    } else {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
holidayController.Holidayedit = async (req, res) => {
  sess = req.session;

  const user_id = req.user._id;
  const role_id = req.user.role_id.toString();
  helper
    .checkPermission(role_id, user_id, "Update Holiday")
    .then(async (rolePerm) => {
      if (rolePerm.status == true) {
        const _id = req.params.id;
        const holidayData = await holidayApi.getHoliday(_id);
        res.json({ holidayData });
      } else {
        res.status(403).json({ status: false });
      }
    })
    .catch((error) => {
      res.status(403).send(error);
    });
};
holidayController.Holidayupdate = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();

    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "Update Holiday"
    );
    const data = req.body;
    const _id = req.params.id;
    if (rolePerm.status) {
      await holidayApi.updateHoliday({ data, _id });
      res.status(201).json({ message: "Holiday Updated Successfully" });
    } else {
      res.status(403).json({ status: false ,errors:'Permission denied' });
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      const errorMessages = Object.keys(error.errors).map(
        (key) => error.errors[key].message
      );
      res.status(400).json({ errors: errorMessages.join(", ") });
    } else if (error.name === "PermissionError") {
      res.status(403).json({ message: error.message });
    } else {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
holidayController.deleteHoliday = async (req, res) => {
  try {
    sess = req.session;
    const user_id = req.user._id;
    const role_id = req.user.role_id.toString();

    const rolePerm = await helper.checkPermission(
      role_id,
      user_id,
      "Delete Holiday"
    );
    if (rolePerm.status == true) {
      const _id = req.params.id;
      const data = {
        deleted_at: Date(),
      };
      await holidayApi.deleteHoliday({ data, _id });
      res.status(201).json({ message: "Holiday Deleted Successfully" });
    } else {
      res.status(403).json({ status: false ,errors:'Permission denied' });
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      const errorMessages = Object.keys(error.errors).map(
        (key) => error.errors[key].message
      );
      res.status(400).json({ errors: errorMessages.join(", ") });
    } else if (error.name === "PermissionError") {
      res.status(403).json({ message: error.message });
    } else {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  //   }
  //   .catch((error) => {
  //     res.status(403).send(error);
  //   });
};

module.exports = holidayController;
