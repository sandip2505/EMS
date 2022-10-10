// const dotenv = require('dotenv');
const addEmployees = require('./employee-seed');
const addEmployee = require('../src/model/addEmployee');
const connectDB = require('../src/db/conn');

dotenv.config();

connectDB();

const importProducts = async () => {
    try {
        await Product.deleteMany();

        await addEmployee.insertMany(addEmployees);

        console.log('Data Imported');
        process.exit();
    } catch (err) {
        console.log(error);
        process.exit(1);
    }
};

const deleteProducts = async () => {
    try {
        await Product.deleteMany();

        console.log('Data destroyed');
        process.exit();
    } catch (err) {
        console.log(error);
        process.exit(1);
    }
};

// importProducts();
// deleteProducts();

switch (process.argv[2]) {
    case '-d': {
        deleteProducts();
        break;
    }
    default: {
        importProducts();
    }
}