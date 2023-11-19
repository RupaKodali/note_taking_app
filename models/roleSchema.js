const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseBootstrapper = require('../utils/mongoose-model-bootstrapper.js');
const ModelMethodsBootstrapper = require('../utils/mongoose-methods-bootstrapper.js');

const RoleSchema = mongooseBootstrapper({
    roleId: { type: String }, // The ID of the role that the user has.

    name: { type: String, unique: true }, // The name of the role.

    permissions: [String], // A list of the permissions granted to the role.

}, [])


RoleSchema.plugin(mongoosePaginate);
let modelBase = mongoose.model('Roles', RoleSchema)
module.exports = new ModelMethodsBootstrapper(modelBase, 'Roles');
