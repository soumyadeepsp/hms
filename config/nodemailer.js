import nodemailer from 'nodemailer';

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: 'soumyadeepsp@gmail.com', // Your email address
        pass: ''   // Your email password or app-specific password
    }
});

// Function to send an email
export const sendEmail = async (to, subject, text) => {
    const mailOptions = {
        from: 'soumyadeepsp@gmail.com', // Sender address
        to: to,                       // List of recipients
        subject: subject,             // Subject line
        text: text                    // Plain text body
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email: ', error);
    }
}

// Example usage
// sendEmail('soumyadeep18104@iiitd.ac.in', 'tetsing out nodemailer', 'hello, how are you?')
//     .then(() => console.log('Email sent successfully'))
//     .catch(err => console.error('Error sending email:', err));