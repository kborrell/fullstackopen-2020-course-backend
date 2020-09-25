const mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator')

const uri = process.env.MONGODB_URI

console.log('connection to', uri)
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => console.log('connected to MongoDB'))
  .catch(error => console.log('error connecting to MongoDB', error.message))

const personSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, uniqueCaseInsensitive: true, minlength: 3 },
  number: { type: String, required: true, unique: true,  uniqueCaseInsensitive: true, minlength: 8 }
})
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString(),
    delete returnedObject._id
    delete returnedObject.__v
  }
})
personSchema.plugin(uniqueValidator, { message: 'Error, {PATH} must be unique' })

module.exports = mongoose.model('Person', personSchema)