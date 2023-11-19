const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseBootstrapper = require('../utils/mongoose-model-bootstrapper.js');
const ModelMethodsBootstrapper = require('../utils/mongoose-methods-bootstrapper.js');

const UserRoleSchema = mongooseBootstrapper({

    userId: { type: String }, // The ID of the user to which the role belongs.

    roleId: { type: String }, // The ID of the role that the user has.

}, [])


UserRoleSchema.plugin(mongoosePaginate);
let modelBase = mongoose.model('UserRoles', UserRoleSchema)
module.exports = new ModelMethodsBootstrapper(modelBase, 'UserRoles');
