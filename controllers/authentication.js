const bcrypt = require('bcrypt');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const { db } = require("../dbConnection");
const { transporter } = require('../mailConnection');

module.exports.signup = async(req, res) => {
    //Use OTP to signup
    const {username, email, password} = req.body;
    
    if(username && email && password) {
        const searchQuery = 'SELECT * FROM USERS WHERE EMAIL = ?';
        const findUser = mysql.format(searchQuery, [email]);
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(findUser, (err, rows, fields) => {
            if(!err){
                if(rows.length === 0){
                    const insertQuery = 'INSERT INTO USERS VALUES (0,?,?,?,?)';
                    const insertUser = mysql.format(insertQuery, [username,email,hashedPassword,'not verified']);
                    db.query(insertUser, (err1, rows1, fields1) => {
                        if(!err1){
                            const userId = rows1.insertId;
                            const OTP = Math.floor(100000 + Math.random() * 900000);
                            const currentDate = new Date();
                            const expiryTimeJS = new Date(currentDate.getTime() + (20 * 60 * 1000));
                            const insertOTPQuery = 'INSERT INTO TOKENVALIDITY VALUES (?,?,?)';
                            const insertOTP = mysql.format(insertOTPQuery,[userId,OTP,expiryTimeJS]);
                            db.query(insertOTP,(err2, rows2, fields2) => {
                                const mailOptions = {
                                    from: 'premtg001@gmail.com',
                                    to: email,
                                    subject: 'your OTP for ecommerce site',
                                    html: `OTP for ecommerce site login is ${OTP}`,
                                };
                                transporter.sendMail(mailOptions, (err2, info) => {
                                    if (err2) {
                                      res.json(err2);
                                    } else {
                                      // res.send(rows);
                                      res.json({ message: 'OTP Mail Sent' });
                                    }
                                })
                                // console.log(rows1.insertId);
                                res.json({message: 'OTP sent to registered mail'});
                            })
                            
                        }else{
                            res.json({error:err1});
                        }
                    });
                }else{
                    res.json({message:' User already exists'});
                }
            }else{
                res.json({error:err});
            }
        })
    }else{
        res.json({message: 'Email or Password or Username is missing'});
    }
    
};

module.exports.signupOTP = async(req, res) => {
    //Use OTP to signup
    const {userId,OTP} = req.body;
    if(userId && OTP){
        const OTPExpiryQuery = 'SELECT * FROM TOKENVALIDITY WHERE USERID = ?';
        const OTPExpiryCheck = mysql.format(OTPExpiryQuery,[userId,OTP]);
        db.query(OTPExpiryCheck,(err,rows,fields) => {
            if(!err){
                const {ExpiresIn} = rows[0];
                const currentDate = new Date();
                if(currentDate<ExpiresIn){
                    const verifyUserQuery = 'UPDATE USERS SET VERIFICATIONSTATUS = ?';
                    const verifyUser = mysql.format(verifyUserQuery,['verified']);
                    db.query(verifyUser,(err1,rows1,fields1) => {
                        if(!err){
                            res.json({message:'User Verified'});
                        }else{
                            res.json({error:err1});
                        }
                    });
                }else{
                    res.json({message: 'OTP Expired'});
                }

            }else{
            res.json({error:err});
            }
        });
    }else{
        res.json({message:'UserId or OTP is empty'});
    }
};

module.exports.login = async(req, res) => {
    const {email, password} = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    if(email && password){
        const searchQuery = 'SELECT * FROM USERS WHERE EMAIL = ?';
        const searchUser = mysql.format(searchQuery,[email]);
        console.log("Here");
        db.query(searchUser, (err,rows,fields) => {
            //JWT logic goes here
            if(!err){
                if(rows.length > 0){
                    const { userId } = rows[0];
                    const token = async function() {
                        await jwt.sign({ userId }, process.env.HASH_KEY, {
                            expiresIn: '7d',
                          });                      
                    }
                    token();
                    res.cookie('token', token, {
                        httpOnly: true,
                      });
                      res.json({message:'User Logged in'});
                }else{
                    res.json({message:'No user Found. Please register'});
                }
            }
        })
    }else{
        res.json({message: 'username and password is required'});
    }

    // res.json({message:username});
};

module.exports.home = async(req, res) => {
    res.json({message:"Inside Home"});
};

