
const AddPermissions = require("../../src/model/addpermissions");
const Announcement = require("../../src/model/Announcement");
const AnnouncementStatus = require("../../src/model/announcementStatus");
const AssignInventory = require("../../src/model/assignInventory");
const Category = require("../../src/model/category");
const City = require("../../src/model/city");
const CompanySetting = require("../../src/model/companySetting");
const Countries = require("../../src/model/countries");
const CpuMasterInventory = require("../../src/model/cpuMasterInventory");
const CreateProject = require("../../src/model/createProject");
const CreateTask = require("../../src/model/createTask");
const Currency = require("../../src/model/currencie");
const Customer = require("../../src/model/customer");
const Expenses = require("../../src/model/expenses");
const Holiday = require("../../src/model/holiday");
const InventoryItem = require("../../src/model/inventoryItem");
const Invoice = require("../../src/model/invoice");
const LeaveHistory = require("../../src/model/leaveHistory");
const Leaves = require("../../src/model/leaves");
const Log = require("../../src/model/log");
const MasterInventory = require("../../src/model/masterInventory");
const Mediator = require("../../src/model/mediator");
const Payment = require("../../src/model/payment");
const PaymentMode = require("../../src/model/paymentmode");
const PermissionModule = require("../../src/model/permission_module");
const RolePermission = require("../../src/model/rolePermission");
const Roles = require("../../src/model/roles");
const SalarySlipGenerated = require("../../src/model/salaryparticulars");
const Salary = require("../../src/model/salary");
const SalaryStructure = require("../../src/model/salarystructure");
const Settings = require("../../src/model/settings");
const Technology = require("../../src/model/technology");
const TimeEntries = require("../../src/model/timeEntries");
const TimeEntryRequest = require("../../src/model/timeEntryRequest");
const Token = require("../../src/model/token");
const TrailApi = require("../../src/model/trailApi");
const User2Fa = require("../../src/model/user_2fa");
const User = require("../../src/model/user");
const UserPermission = require("../../src/model/userPermission");
const WorkingHour = require("../../src/model/working_hour");
const cron = require('node-cron');
const nodemailer = require('nodemailer');



const sendBackupEmail = async () => {
    try {
        // Fetch data from all models
        const modelData = await Promise.all([
            AddPermissions.find(),
            Announcement.find(),
            AnnouncementStatus.find(),
            AssignInventory.find(),
            Category.find(),
            City.find(),
            CompanySetting.find(),
            Countries.find(),
            CpuMasterInventory.find(),
            CreateProject.find(),
            CreateTask.find(),
            Currency.find(),
            Customer.find(),
            Expenses.find(),
            Holiday.find(),
            InventoryItem.find(),
            Invoice.find(),
            LeaveHistory.find(),
            Leaves.find(),
            Log.find(),
            MasterInventory.find(),
            Mediator.find(),
            Payment.find(),
            PaymentMode.find(),
            PermissionModule.find(),
            RolePermission.find(),
            Roles.find(),
            SalarySlipGenerated.find(),
            Salary.find(),
            SalaryStructure.find(),
            Settings.find(),
            Technology.find(),
            TimeEntries.find(),
            TimeEntryRequest.find(),
            Token.find(),
            TrailApi.find(),
            User2Fa.find(),
            User.find(),
            UserPermission.find(),
            WorkingHour.find()
        ]);

        // Create attachments array with Buffer data
        const attachments = [
            { filename: 'addpermissions.json', content: Buffer.from(JSON.stringify(modelData[0], null, 2)) },
            { filename: 'announcement.json', content: Buffer.from(JSON.stringify(modelData[1], null, 2)) },
            { filename: 'announcementStatus.json', content: Buffer.from(JSON.stringify(modelData[2], null, 2)) },
            { filename: 'assignInventory.json', content: Buffer.from(JSON.stringify(modelData[3], null, 2)) },
            { filename: 'category.json', content: Buffer.from(JSON.stringify(modelData[4], null, 2)) },
            { filename: 'city.json', content: Buffer.from(JSON.stringify(modelData[5], null, 2)) },
            { filename: 'companySetting.json', content: Buffer.from(JSON.stringify(modelData[6], null, 2)) },
            { filename: 'countries.json', content: Buffer.from(JSON.stringify(modelData[7], null, 2)) },
            { filename: 'cpuMasterInventory.json', content: Buffer.from(JSON.stringify(modelData[8], null, 2)) },
            { filename: 'createProject.json', content: Buffer.from(JSON.stringify(modelData[9], null, 2)) },
            { filename: 'createTask.json', content: Buffer.from(JSON.stringify(modelData[10], null, 2)) },
            { filename: 'currency.json', content: Buffer.from(JSON.stringify(modelData[11], null, 2)) },
            { filename: 'customer.json', content: Buffer.from(JSON.stringify(modelData[12], null, 2)) },
            { filename: 'expenses.json', content: Buffer.from(JSON.stringify(modelData[13], null, 2)) },
            { filename: 'holiday.json', content: Buffer.from(JSON.stringify(modelData[14], null, 2)) },
            { filename: 'inventoryItem.json', content: Buffer.from(JSON.stringify(modelData[15], null, 2)) },
            { filename: 'invoice.json', content: Buffer.from(JSON.stringify(modelData[16], null, 2)) },
            { filename: 'leaveHistory.json', content: Buffer.from(JSON.stringify(modelData[17], null, 2)) },
            { filename: 'leaves.json', content: Buffer.from(JSON.stringify(modelData[18], null, 2)) },
            { filename: 'log.json', content: Buffer.from(JSON.stringify(modelData[19], null, 2)) },
            { filename: 'masterInventory.json', content: Buffer.from(JSON.stringify(modelData[20], null, 2)) },
            { filename: 'mediator.json', content: Buffer.from(JSON.stringify(modelData[21], null, 2)) },
            { filename: 'payment.json', content: Buffer.from(JSON.stringify(modelData[22], null, 2)) },
            { filename: 'paymentMode.json', content: Buffer.from(JSON.stringify(modelData[23], null, 2)) },
            { filename: 'permissionModule.json', content: Buffer.from(JSON.stringify(modelData[24], null, 2)) },
            { filename: 'rolePermission.json', content: Buffer.from(JSON.stringify(modelData[25], null, 2)) },
            { filename: 'roles.json', content: Buffer.from(JSON.stringify(modelData[26], null, 2)) },
            { filename: 'salarySlipGenerated.json', content: Buffer.from(JSON.stringify(modelData[27], null, 2)) },
            { filename: 'salary.json', content: Buffer.from(JSON.stringify(modelData[28], null, 2)) },
            { filename: 'salaryStructure.json', content: Buffer.from(JSON.stringify(modelData[29], null, 2)) },
            { filename: 'settings.json', content: Buffer.from(JSON.stringify(modelData[30], null, 2)) },
            { filename: 'technology.json', content: Buffer.from(JSON.stringify(modelData[31], null, 2)) },
            { filename: 'timeEntries.json', content: Buffer.from(JSON.stringify(modelData[32], null, 2)) },
            { filename: 'timeEntryRequest.json', content: Buffer.from(JSON.stringify(modelData[33], null, 2)) },
            { filename: 'token.json', content: Buffer.from(JSON.stringify(modelData[34], null, 2)) },
            { filename: 'trailApi.json', content: Buffer.from(JSON.stringify(modelData[35], null, 2)) },
            { filename: 'user2Fa.json', content: Buffer.from(JSON.stringify(modelData[36], null, 2)) },
            { filename: 'user.json', content: Buffer.from(JSON.stringify(modelData[37], null, 2)) },
            { filename: 'userPermission.json', content: Buffer.from(JSON.stringify(modelData[38], null, 2)) },
            { filename: 'workingHour.json', content: Buffer.from(JSON.stringify(modelData[39], null, 2)) }
        ];

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'meetnode@gmail.com',
                pass: 'wunpnyieowmaigzd'
            }
        });

        const mailOptions = {
            from: 'meetnode@gmail.com',
            to: 'codecrew0@gmail.com',
            subject: 'Complete Database Backup',
            text: 'Please find attached the complete backup of all database collections.',
            attachments
        };

        await transporter.sendMail(mailOptions);
        console.log('Complete backup email sent successfully!');
        return true;
    } catch (err) {
        console.error('Error sending backup email:', err);
        throw new Error('An error occurred while sending backup email.');
    }
};

cron.schedule('15 10 * * 1', async () => {
    console.log('Running backup task...');
    try {
        await sendBackupEmail();
    } catch (err) {
        console.error('Error running the backup task:', err);
    }
});