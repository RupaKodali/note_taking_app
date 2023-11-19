const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseBootstrapper = require('../utils/mongoose-model-bootstrapper.js');
const ModelMethodsBootstrapper = require('../utils/mongoose-methods-bootstrapper.js');

const NoteSchema = mongooseBootstrapper(
  {
    title: { type: String },

    noteId: { type: String },

    userId: { type: String }, // The ID of the user who created the note.

    encryptedContent: { type: Object }, // The encrypted content of the note.

    isDeleted: { type: Boolean, default: false },

    deletedAt: { type: Date, default: null },
  },
  []
);

NoteSchema.plugin(mongoosePaginate);
let modelBase = mongoose.model("Notes", NoteSchema);
module.exports = new ModelMethodsBootstrapper(modelBase, "Notes");
