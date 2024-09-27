const mongoose = require('mongoose');

// Replace with your MongoDB connection string
const mongoURI = 'mongodb://localhost:27017/your_database_name';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected');
        seedData();
    })
    .catch(err => console.error(err));

const User =  require('../src/model/user');

async function seedData() {
    try {
        const data = {
            firstname: 'Vishw',
            middlename: 'Amitbhai',
            lastname: 'Panchal',
            password: '$2a$10$xm2z2WwWhMatxVuwrL0qDOzaHLtuwTttndgEBJFN0ObQSPWoV7ueS',
            parent_id: null,
            payment_id: 'pay_OFs8h4NO9WO2AG',
            email: 'vishwprajapati66@gmail.com',
            locations_id: mongoose.Types.ObjectId('64956f9a074819de3e34ed24'),
            dob: new Date('2002-05-28T09:55:00.000Z'),
            mobile_number: 9173211901,
            photo: 'efa44215-13ff-40bc-a475-8891de113f3c.jpg',
            personal_id: 'ASGPS0001',
            state: 'gujha',
            city: 'Ahmedabad',
            pincode: '382415',
            gender: 'male',
            education: 'PHD',
            address: 'Ghh or',
            relationship: null,
            job: 'software',
            marital_status: 'married',
            device_token: 'eQfR3NOsRbCbhHErhaWlGn:APA91bGZA-QlrJ_EOMvblQbOiMvhGq2BE7g2qGRDYsz3yyJEQp4sF--5e4Gn1QyRgkOPhWh4qnOjgBqxwVbEzvbpXYxh8ZBWyc-b-n0LBCR7vL6PanNp3LzpSoGUr7qekeV8D64QsIEk',
            updated_at: new Date('Thu Jun 27 2024 20:06:02 GMT+0530 (India Standard Time)'),
            deleted_at: null,
            created_at: '1716890200268',
            __v: 0,
            profile_banner: '6d6f0e9f-5902-446a-9641-92b2ff2933e0.jpg'
        };

        await User.create(data);
        console.log('Data inserted successfully');
    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        mongoose.disconnect();
    }
}
