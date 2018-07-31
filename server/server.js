const express = require('express');
const bodyParser = require('body-parser');

const {ObjectID} = require('mongodb');
const { mongoose } = require('./db/mongoose');
const { User } = require('./models/user');
const { Todo } = require('./models/todo');

const app = express();

app.use(bodyParser.json());

const writeData = async (data) => {
  try {
    const doc = await data.save();
    return doc;
  }
  catch(error) {
    throw('Error: Unable to save!');
  }
}

app.post('/todos', async (req, res) => {
  const todo = new Todo({
    text: req.body.text
  })
  try {
    const doc = await writeData(todo);
    console.log('Saved: \n', JSON.stringify(doc, undefined, 2));
    res.status(200).send(doc);
  }
  catch(error) {
    console.log(error);
    res.status(400).send(error);
  }
})

app.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.find({});
    res.status(200).send(todos);
  }
  catch(error) {
    res.sendStatus(400);
  }
})

app.get('/todos/:id', async (req, res) => {
  const id = req.params.id;
  if(ObjectID.isValid(id)) {
    try {
      const todo = await Todo.findById(id);
      if(todo) {
        res.status(200).send(todo);
      }
      else {
        res.sendStatus(404);
      }
    }
    catch(error) {
      res.sendStatus(400);
    }
  }
  else {
    res.sendStatus(400);
  }
})

app.listen(3000, () => {
  console.log('Server is running!');
})

module.exports = {
  app
}

/*
const newTodo = new Todo({
  text: 'Poop',
  completed: false,
  completedAt: 1300
})

const newUser = new User({
  email: 'kerbal@gmail.com',
  password: '123456789abc'
})

writeData(newTodo);
writeData(newUser);
*/