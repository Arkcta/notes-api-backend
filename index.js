require('dotenv').config()

require('./mongo');

const express = require('express');
const app = express();
const cors = require('cors');
const Note = require('./models/Note');
const notFound = require('./middleware/notFound.js');
const handleErrors = require('./middleware/handleErrors');

app.use(cors());
app.use(express.json());

let notes = [];

const generateId = () => {
  const ids = notes.map((note) => note.id);
  const maxId = ids.length ? Math.max(...ids) : 0;
  const newId = maxId + 1;
  return newId;
}

app.get("/", (request, response) => {
  response.send("<h1>Hello World</h1>");
});

app.get("/api/notes", async (request, response) => {
  const notes = await Note.find({});
  return response.json(notes);
});

app.get("/api/notes/:id", (request, response, next) => {
  const id = request.params.id;

  Note.findById(id).then(note => {
    if (note) {
      response.json(note);
    } else {
      response.status(404).end();
    }
  }).catch(err => {
    next(err);
  });
});

app.put("/api/notes/:id", (request, response, next) => {
  const { id } = request.params;
  const note = request.body;

  const newNoteInfo = {
    content: note.content,
    important: note.important
  }

  Note.findByIdAndUpdate(id, newNoteInfo, { new: true })
    .then(result => {
      response.json(result);
    }).catch(error => next(error));
});

app.delete("/api/notes/:id", async (request, response, next) => {
  const { id } = request.params;
  try {
    await Note.findByIdAndRemove(id);
    response.status(204).end();
  } catch (error) {
    next(error)
  }
})

app.post("/api/notes/", async (request, response) => {
  const note = request.body;
  if (!note || !note.content) {
    return response.status(400).json({
      'error': 'note.content is missing'
    })
  }
  const newNote = new Note({
    content: note.content,
    important: typeof note.important != "undefined" ? note.important : false,
    date: new Date().toISOString(),
  });

  // newNote.save().then(savedNote => {
  //   response.json(savedNote)
  // }).catch(err => next(err));
  try {
    const savedNote = await newNote.save();
    response.json(savedNote);
  } catch (error) {
    next(error)
  }

});

app.use(notFound);

app.use(handleErrors);


const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server };