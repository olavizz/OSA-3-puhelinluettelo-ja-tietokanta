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


app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })

})

//app.get('/info', (request, response) => {
//  const time = new Date()
//  response.send(
//    `
//    <h4>Phonebook has info for ${persons.length} people</h4>
//    <h4>${time}</h4>
//  `
 // )
//})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
  })
  .catch(error => next(error))
  })

app.delete('/api/persons/:id', (request, response,  next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const isName = persons.some(person => person.name === body.name)

  if (isName) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  }

  console.log(request.body)
  var number = Math.floor(Math.random() * 1000)
  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })

  console.log(number)
  console.log(person)
  persons = persons.concat(person)
})
const PORT = process.env.PORT
app.listen(PORT)
console.log(`Server running on port ${PORT}`)