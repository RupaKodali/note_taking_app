const express = require('express');
const router = express.Router();

const NoteController= require('../services/note.service.js');
const noteController = new NoteController();


router.get("/getNote",(req,res)=>{
    noteController.getNote(req,res)
})
router.get("/getallNotes",(req,res)=>{
    noteController.getallNotes(req,res)
})

router.post("/addNote",(req,res)=>{
    noteController.addNote(req,res)
})

module.exports = router;