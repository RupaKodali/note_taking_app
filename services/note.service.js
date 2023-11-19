const NoteSchema = require("../models/NoteSchema.js");
const { v4: uuidv4 } = require('uuid');
const userSchema = require("../models/UserSchema.js");
const { encrypt, decrypt } = require('../utils/crypto.js')

class NoteController {
  async addNote(req, res) {
    try {
      const user = await userSchema.find({ userId: req.user.userId });
      if (!user) {
        return res.status(404).json({ status: false, message: "Invalid User" });
      }

      // Encrypt the note content before saving it to the database
      const encryptedContent = await encrypt(req.body.description, user.encryptionKey);

      if ((req.body.description).length <= 0 && (req.body.title).length <= 0) {
        return res.status(200).json({ status: true, message: "empty note" });
      }

      // Create a new note document
      const note = await NoteSchema.create({
        userId: req.user.userId,
        title: req.body.title,
        noteId: uuidv4(),
        encryptedContent: encryptedContent,
      });

      // Return the new note document
      return res.status(200).json({ status: true, data: note });
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
  }

  async getNote(req, res) {
    try {
      const user = await userSchema.find({ userId: req.user.userId });
      if (!user) {
        return res.status(404).json({ status: false, message: "Invalid User" });
      }

      // Find the note document by its ID
      let note = await NoteSchema.find({
        noteId: req.query.id,
        userId: req.user.userId,
        isDeleted: false
      });

      // Decrypt the note content before returning it to the user
      if (note) {
        let new_note = JSON.parse(JSON.stringify(note));
        new_note.description = await decrypt(note.encryptedContent, user.encryptionKey);
        delete new_note.encryptedContent
        return res.status(200).json({ status: true, data: new_note, message: "Sucessfully opened notes" });

      } else {
        return res.status(404).json({ status: false, message: "Note not found" });
      }
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
  }

  async getallNotes(req, res) {
    try {
      const user = await userSchema.find({ userId: req.user.userId });
      if (!user) {
        return res.status(404).json({ status: false, message: "Invalid User" });
      }

      // const page = req.query.page ? parseInt(req.query.page) : 1;
      // const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;

      // Find all notes for the user with pagination
      // const notes = await NoteSchema.paginate({ userId: req.user.userId }, page, pageSize)
      const notes = await NoteSchema.findAll({ userId: req.user.userId, isDeleted: false })
      let new_notes = []
      // Decrypt the note content for each note
      for (let note of notes) {
        let new_note = JSON.parse(JSON.stringify(note));
        new_note.description = await decrypt(note.encryptedContent, user.encryptionKey);
        delete new_note.encryptedContent
        new_notes.push(new_note)
      }

      return res.status(200).json({ status: true, data: new_notes, messgae: "Successfully listed all the notes" });
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
  }

  async deleteNote(req, res) {
    try {
      const user = await userSchema.find({ userId: req.user.userId });
      if (!user) {
        return res.status(404).json({ status: false, message: "Invalid User" });
      }

      // Find the note document by its ID
      let note = await NoteSchema.softDelete({
        noteId: req.query.id,
        userId: req.user.userId,
      });
      return res.status(200).json({ status: true, message: "Sucessfully deleted notes" });

    } catch (error) {
      console.log("error", error);
      return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
  }

  async updateNote(req, res) {
    try {
      const user = await userSchema.find({ userId: req.user.userId });
      if (!user) {
        return res.status(404).json({ status: false, message: "Invalid User" });
      }
      // Encrypt the note content before saving it to the database
      const encryptedContent = await encrypt(req.body.description, user.encryptionKey);

      // update the note document by its ID
      let note = await NoteSchema.update({
        noteId: req.query.id,
        userId: req.user.userId,
      }, {
        title: req.body.title,
        encryptedContent: encryptedContent
      });

      return res.status(200).json({ status: true, data: note, message: "Sucessfully updated the note" });

    } catch (error) {
      console.log("error", error);
      return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
  }
}

module.exports = NoteController;
