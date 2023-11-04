const mongoose = require('mongoose');
const glob = require('glob');

mongoose.Promise = global.Promise;

let models=[]
for (let i = 0; i < models.length; i++) {
    require("../"+models[i]);
}

module.exports = mongoose;
