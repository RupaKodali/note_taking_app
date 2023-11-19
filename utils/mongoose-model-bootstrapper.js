const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports  = function (schemaObj, plugins, strictFlag = true) {

    const schema = new Schema(schemaObj,{ timestamps: { createdAt: 'cd', updatedAt: 'ud' }, strict: strictFlag });

    if (plugins) {
        for (let i = 0; i < plugins.length; i++) {
            schema.plugin(require(plugins[i].name), plugins[i].opts);
        }
    }
    schema.pre('save', function (next) {
        this.ud = new Date();
        next();
    });
    return schema;
};
