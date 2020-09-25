const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/person')

morgan.token('response-body', (req) => JSON.stringify(req.body))

app.use(express.json())
app.use(cors())
app.use(morgan('tiny', { skip: (req) => req.method === 'POST' }))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :response-body', { skip: (req) => req.method !== 'POST' }))
app.use(express.static('build'))

app.get('/info', (req, res) => {
  Person.find({}).then(response =>  res.send(`<p>Phonebook has info for ${response.length} people</p><p>${new Date().toString()}</p>`))
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(people => res.json(people))
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).send({ error: `Person with id ${req.params.id} not found` })
      }
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body
  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => res.json(updatedPerson))
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => res.status(204).end())
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body
  if (!body.name) {
    return res.status(400).send({ error: 'name missing' })
  }
  if (!body.number) {
    return res.status(400).send({ error: 'number missing' })
  }

  const person = Person({
    name: body.name,
    number: body.number
  })

  person.save()
    .then(response => res.json(response))
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.name, error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'SyntaxError' || error.name === 'TypeError') {
    return response.status(500).send({ error: 'internal error' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})