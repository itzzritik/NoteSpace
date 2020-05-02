const mongoose = require('mongoose');

let notes = new mongoose.Schema({
        id: String,
        title: String,
        color: String,
        type: String,
        content: String,
    },
    {
        timestamps: true
    }),
    NoteSpace = mongoose.model('notespace', new mongoose.Schema({
        token : String,
        notebook: [notes]
    }));

module.exports = NoteSpace;