const nodemailer = require('nodemailer');

module.exports.transporter = nodemailer.createTransport({

  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.EUSER,
    pass: process.env.EPASS,
  },

});