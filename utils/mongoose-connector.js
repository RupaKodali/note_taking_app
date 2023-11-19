'use strict';

const mongoose = require('mongoose');
const config = require('../config')
const options = { connectTimeoutMS: 3000};
mongoose.connect( config.app.dbURL, options)
let mongo = mongoose.connection
mongo.on('connecting', () => {
    console.info('Connecting to MongoDB...!')
})
mongo.on('open', () => {
    console.info('Connected to MongoDB...!')
})
mongo.on('disconnected', () => {
    console.error('MongoDB Connection Lost...!')
})
mongo.on('reconnected',()=>{
    console.info('Reconnected to MongoDB...!')
})
mongo.on('error', (error) => {
    console.error('Unable to connect MongoDB...!')
    throw error;
})