const { app } = require('../index');
const supertest = require('supertest');
const api = supertest(app);

const initialNotes = [
    {
        content: 'Aprendiendo FullStack JS con mideduv',
        important: true,
        date: new Date()
    },
    {
        content: 'Sigueme en https://midu.tube',
        important: true,
        date: new Date()
    }
];

const getAllContentFromNotes = async() => {
    const response = await api.get('/api/notes');
    return {
        contents: response.body.map(note => note.content),
        response
    }
}

module.exports = {
    initialNotes,
    api,
    getAllContentFromNotes
};