require('dotenv').config()
const express = require('express')
var morgan = require('morgan')
const app = express()
app.use(express.json())
const cors = require('cors')
app.use(cors())
app.use(express.static('dist'))
const Person = require('./models/persons')

morgan.token('data', function(req, res) {
  return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.status === 'CastError') {
    return response.status(400).send({error: "malformatted id"})
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({error: error.message})
  }

  next(error)
}

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(persons => {
    response.json(persons)
  })
    .catch(error => next(error))

})

app.get('/info', (request, response) => {
  const time = new Date()
  Person.find({})
    .then(persons => {
      response.send(
        `
        <h4>Phonebook has info for ${persons.length} people</h4>
        <h4>${time}</h4>
      `)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
}})
    .catch(error => next(error))
  })

app.delete('/api/persons/:id', (request, response,  next) => {
  
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({error: "missing name or number"})
    }
  

  console.log(request.body)
  const person = new Person({
    _id: Math.floor(Math.random() * 1000000),
    name: body.name,
    number: body.number
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
  })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(
    request.params.id,
    { number: body.number }, 
    { new: true, runValidators: true, context: 'query' }
    )
   .then(updatedPerson => {
    if (!updatedPerson) {
      return response.status(400).json({error: "PersonNotFound"})
    }
    response.json(updatedPerson)
   })
   .catch(error => {
    console.log(error)
    next(error) 
  })
})


app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT)
console.log(`Server running on port ${PORT}`)