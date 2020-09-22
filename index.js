const { response } = require('express')
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

morgan.token('response-body', (req, res) => JSON.stringify(req.body))

app.use(express.json())
app.use(cors())
app.use(morgan('tiny', { skip: (req, res) => req.method === 'POST'}))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :response-body', { skip: (req, res) => req.method !== 'POST' }))
app.use(express.static('build'))

let persons = [
    { id: 1, name: 'Arto Hellas', number: '040-123456' },
    { id: 2, name: 'Ada Lovelace', number: '39-44-5323523' },
    { id: 3, name: 'Dan Abramov', number: '12-43-234345' },
    { id: 4, name: 'Mary Poppendieck', number: '39-23-6423122' }
]

app.get('/info', (req, res) => {
    res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date().toString()}</p>`)
})

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
    var id = Number(req.params.id)
    var person = persons.find((person) => person.id === id)
    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})

app.delete('/api/persons/:id', (req, res) => {
    var id = Number(req.params.id)
    persons = persons.filter((person) => person.id !== id)
    res.status(204).end()
})

const getRandomId = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const sendError = (response, status, msg) => {
    return response.status(status).json({ error: msg })
}

app.post('/api/persons', (req, res) => {
    var body = req.body

    if (!body.name) {
        return sendError(res, 400, 'nameMissing')
    }

    if (!body.number) {
        return sendError(res, 400, 'numberMissing')
    }

    if (persons.find((person) => person.name === body.name)) {
        return sendError(res, 409, `${body.name} already exists`)
    }

    const person = {
        id: getRandomId(1, 9999999),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)
    res.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})