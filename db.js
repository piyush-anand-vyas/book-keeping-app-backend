const mongoose = require('mongoose');
const mongoURI = 'mongodb+srv://piyush:1234@cluster0.oaefp.mongodb.net/book-keeping-app?authSource=admin&replicaSet=atlas-7algq7-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true'

const connectToMongo = ()=>{
    mongoose.connect(mongoURI, ()=>{
        console.log('Connected to database');
    })
}

module.exports = connectToMongo