const express = require("express");
const dotenv = require("dotenv");
const { default: mongoose } = require("mongoose");
const passport = require('passport');
const routes = require('./routes');
const bodyParser = require("body-parser");
const session = require('express-session');
const cors = require('cors');

dotenv.config()

const app = express();
const port = process.env.PORT||5000;

app.use(cors());

app.get('/', (req,res)=>{
    return res.send('Hello World');
})

app.use(bodyParser.json())


app.get('/', (req,res)=>{
    return res.send('Hello World');
})

// Passport and session setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret',
    resave: false,
    saveUninitialized: true,
}));

app.use(passport.initialize());  // Initialize passport
app.use(passport.session());     // Use passport session

routes(app);


mongoose.connect(`${process.env.MONGO_DB}`)
    .then(() => {
        console.log('Connect DB success');
    })
    .catch((err)=>{
        console.log(err);
    })
    

app.listen (port, ()=>{
    console.log(`Server is running in local host: ${port}`);
})