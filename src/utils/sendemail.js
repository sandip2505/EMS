
const mailConfigurations = {
    from: 'mrtwinklesharma@gmail.com',
    to: 'smtwinkle451@gmail.com',
    subject: 'Sending Email using Node.js',
    text: 'Attachments can also be sent using nodemailer',
    attachments: [
        {
            // utf-8 string as an attachment
            filename: 'text.txt',
            content: 'Hello, GeeksforGeeks Learner!'
        },
        {
            // filename and content type is derived from path
            path: '/home/mrtwinklesharma/Programming/document.docx'
        },
        {
            path: '/home/mrtwinklesharma/Videos/Sample.mp4'
        },
        {
            // use URL as an attachment
            filename: 'license.txt',
            path: 'https://raw.github.com/nodemailer/nodemailer/master/LICENSE'
        }
    ]
};