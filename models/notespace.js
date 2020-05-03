const mongoose = require('mongoose');

let notes = new mongoose.Schema({
        id: {type: String, required : true, index: {unique: true}},
        title: { type : String, default: 'New Tab'},
        color: { type : String, default: '#673AB7'},
        type: { type : String, default: 'plaintext'},
        content: { type : String, default: ''},
    },
    {
        timestamps: true
    }),
    NoteSpace = mongoose.model('notespace', new mongoose.Schema({
        token : {type: String, index: {unique: true}},
        notebook: [notes]
    }));

module.exports = NoteSpace;