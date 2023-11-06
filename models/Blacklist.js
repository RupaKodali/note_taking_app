const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseBootstrapper = require('../utils/mongoose-model-bootstrapper.js');
const ModelMethodsBootstrapper = require('../utils/mongoose-methods-bootstrapper.js');

const BlackListSchema = mongooseBootstrapper({
    token: { type: String }
}, [])


BlackListSchema.plugin(mongoosePaginate);
let modelBase = mongoose.model('Blacklist', BlackListSchema)
module.exports = new ModelMethodsBootstrapper(modelBase, 'Blacklist');
