const mongoose = require('mongoose');

//mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;


const AuthorSchema = new Schema({
    name: { type: String, required: true },
    age: Number,
    notes: [
        { type: Schema.Types.ObjectId, ref: 'Note' }
    ]
});

const NoteSchema = new Schema({

    title: { type: String, required: true },
    content: String,
    authors: [
        { type: Schema.Types.ObjectId, ref: 'Author' }
    ]
}, {
    timestamps: true
});
const Note = mongoose.model('Note', NoteSchema, 'notes');
const Author = mongoose.model('Author', AuthorSchema, 'authors');

module.exports = {
    Note,
    Author
}