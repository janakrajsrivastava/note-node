const { response } = require('express');

const Model = require('../models/note-model.js');
const Author = Model.Author;
const Note = Model.Note;

//create and save new note
exports.create = async function (req, res) {
    // validate req
    if (!req.body.note.content || !req.body.note.title) {
        return res.status(400).send({ message: "Content/Title cannot be empty!" });
    }
    console.log("body validation done")
    var n = req.body.authors.length;
    if (n === 0) {
        return res.status(400).send({ message: "Authors cannot be empty!" });
    }
    const authorList = req.body.authors;
    // validate authorID
    for (var i = 0; i < n; i++) {
        console.log(i);
        if (authorList[i]._id) {
            var isValidAuthor = await Author.findById(authorList[i]._id)
                .then()
                .catch(err => { console.log(err.message); })
            if (!isValidAuthor)
                return res.status(400).send({ message: "Invalid AuthorID" });
        }
    };
    console.log("data validation done");
    // create Note
    const note = new Note({
        title: req.body.note.title,
        content: req.body.note.content,
    });
    var savedNote = await note.save().then(res => {
        console.log("dheko saving ke baad ka note yahan par");
        console.log(n);
        for (var i = 0; i < n; i++) {
            var curID = authorList[i]._id;
            if (!curID) {
                const auth = new Author({
                    name: authorList[i].name,
                    age: authorList[i].age

                })
                var savedAuthor = auth.save().then(result => {
                    Note.findByIdAndUpdate(res._id, { $addToSet: { authors: [result._id] } }, { new: true }).then(re => { console.log(re); }).catch(err => { console.log(err) });
                }).catch(err => { console.log(err) });
                auth.notes.push(res);


            }
            else {
                Author.findByIdAndUpdate(curID, { $addToSet: { notes: [res._id] } }, { new: true }).then(re => { console.log(re); }).catch(err => { console.log(err) });
                Note.findByIdAndUpdate(res._id, { $addToSet: { authors: [curID] } }, { new: true }).then(re => { console.log(re); }).catch(err => { console.log(err) });
            }
        }


    }).catch(err => { console.log(err); })
    console.log("helloworld")
    res.send({ message: "Success" });
};
// retrieve and show all notes
exports.findAll = (req, res) => {
    Note.find({}, {})
        .populate({ path: 'authors', select: 'age name' })
        .then(note => {
            var dict = {
                status: response.statusCode,
                message: "Success",
                method: req.method,
                detail: "http://localhost:3000" + req.url,
                data: note
            };
            res.send(dict);
        })
        .catch(err => { res.status(500).send(err) });

};
// find a single note with noteID
exports.findOne = (req, res) => {
    Note.findById(req.params.noteid)
        .populate('authors')
        .then(note => {
            if (!note) {
                return res.status(500).send({ message: "Error 404, Note not found with id " + req.params.noteId })
            }
            var dict = {
                status: response.statusCode,
                message: "Success",
                method: req.method,
                details: "http://localhost:3000" + req.url,
                data: note
            };
            res.send(dict);
        })
        .catch(err => {
            if (err.kind === 'Objectid') {
                return res.status(404).send({ message: "Error 404, Note not found with id " + req.params.noteId })
            }
            return res.status(500).send({ message: "Some error ocurred ID wala" });
        })

};
// find note by search title post
exports.search = (req, res) => {
    var searchBody = req.body;
    var searchString = searchBody.title;
    const query1 = { 'title': { $regex: searchString, $options: "$i" } };
    Note.find(query1, "title")
        .populate('authors', { path: 'authors', select: 'age' })
        .then(note => {
            if (note.length == 0) {
                return res.status(500).send({ message: "Error 404, Note not found with title " + req.params.title })
            }
            var dict = {
                status: response.statusCode,
                message: "Success",
                method: req.method,
                details: "http://localhost:3000" + req.url,
                data: note
            };
            res.send(dict);
        })
        .catch(err => {
            if (err.kind === 'Objectid') {
                return res.status(404).send({ message: "Error 404, Note not found with title " + req.params.title })
            }
            return res.status(500).send({ message: "Some error ocurred title wala" });
        })
}

// update a note by noteID
exports.update = (req, res) => {
    // Validate Request
    if (!req.body.content) {
        return res.status(400).send({ message: "Note content can not be empty" });
    }
    // find and update the note
    Note.findByIdAndUpdate(req.params.noteid, {
        title: req.body.title,
        content: req.body.content
    }, { new: true })
        .then(note => {
            if (!note) {
                return res.status(404).send({ message: "Note not found with id " + req.params.noteId });
            }
            res.send(note);
        })
        .catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({ message: "Note not found with id " + req.params.noteId });
            }
            return res.status(500).send({ message: "Error updating note with id " + req.params.noteId });
        });

};
// delete a note by noteID
exports.delete = (req, res) => {
    Note.findByIdAndRemove(req.params.noteid)
        .then(note => {
            if (!note) {
                return res.status(404).send({ message: "Note not found with id " + req.params.noteId });
            }
            res.send({ message: "Note deleted successfully!" });
        })
        .catch(err => {
            if (err.kind === 'Objectid' || err.name === 'Notfound') {
                return res.status(404).send({ message: "Note not found with id " + req.params.noteId });
            }
            return res.status(500).send({ message: "Could not delete note with id " + req.params.noteId })
        });
};