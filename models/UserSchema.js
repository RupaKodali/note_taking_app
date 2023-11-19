const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseBootstrapper = require('../utils/mongoose-model-bootstrapper.js');
const ModelMethodsBootstrapper = require('../utils/mongoose-methods-bootstrapper.js');
const UserSchema = mongooseBootstrapper({

    userId: { type: String, unique: true },

    firstName: { type: String },

    lastName: { type: String },

    email: { type: String, unique: true },

    password: { type: String, default: null },

    phone: { type: String, unique: true },

    encryptionKey: { type: String },

    twoFactorEnabled: { type: Boolean, default: false }, //TODO

    failedLoginAttempts: { type: Number, default: 0 },
    
    unlockCode: { type: String, default: null},

    resetToken: { type: String, default: null},

    isDeleted: { type: Boolean, default: false },

    deletedAt: { type: Date, default: null },

}, [])

UserSchema.plugin(mongoosePaginate);
let modelBase = mongoose.model('Users', UserSchema)
module.exports = new ModelMethodsBootstrapper(modelBase, 'Users');
