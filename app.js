const dotenv = require('dotenv');

dotenv.config();
const express = require('express');
const loginRoutes = require('./routes/authenticationRoutes');
const { db } = require('./dbConnection');

const app = express();


db.connect((err) => {
    if(err) throw err;
    console.log('mysql db connected');
});

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/', loginRoutes);














app.listen(process.env.PORT || 5000, ()=>console.log(`Server running in port ${process.env.PORT || 5000}`))