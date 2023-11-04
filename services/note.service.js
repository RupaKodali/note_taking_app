const NoteSchema = require("../models/NoteSchema.js");
const { v4: uuidv4 } = require('uuid');
const userSchema = require("../models/UserSchema.js");

class NoteController {
  async addNote(req, res) {
    try {
      const user = await userSchema.find({ userId: req.user.userId });
      if (!user) {
        return res.status(404).json({ message: "Invalid User" });
      }

      // Encrypt the note content before saving it to the database
      const encryptedContent = await encrypt(req.body.description, user.encryptionKey);

      // Create a new note document
      const note = await NoteSchema.create({
        userId: req.user.userId,
        title: req.body.title,
        noteId: uuidv4(),
        encryptedContent: encryptedContent,
      });

      // Return the new note document
      return res.status(201).json(note);
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async getNote(req, res) {
    try {
      const user = await userSchema.find({ userId: req.user.userId });
      if (!user) {
        return res.status(404).json({ message: "Invalid User" });
      }

      // Find the note document by its ID
      let note = await NoteSchema.find({
        noteId: req.query.id,
        userId: req.user.userId,
      });

      // Decrypt the note content before returning it to the user
      if (note) {
        let new_note = JSON.parse(JSON.stringify(note));
        new_note.description = await decrypt(note.encryptedContent, user.encryptionKey);
        delete new_note.encryptedContent
        return res.json(new_note);

      } else {
        return res.status(404).json({ message: "Note not found" });
      }
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async getallNotes(req, res) {
    try {
      const user = await userSchema.find({ userId: req.user.userId });
      if (!user) {
        return res.status(404).json({ message: "Invalid User" });
      }

      // const page = req.query.page ? parseInt(req.query.page) : 1;
      // const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;

      // Find all notes for the user with pagination
      // const notes = await NoteSchema.paginate({ userId: req.user.userId }, page, pageSize)
      const notes = await NoteSchema.findAll({ userId: req.user.userId })

      // Decrypt the note content for each note
      for (let note of notes) {
        note.description = await decrypt(note.encryptedContent, user.encryptionKey);
      }

      return res.json(notes);
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

}

module.exports = NoteController;
