const express = require('express');
const bodyParser = require('body-parser');

const {ObjectID} = require('mongodb');
const { mongoose } = require('./db/mongoose');
const { User } = require('./models/user');
const { Todo } = require('./models/todo');
const { authenticate } = require('./middleware/authenticate');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', authenticate, async (req, res) => {
  const todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  })
  try {
    const doc = await todo.save();
    res.status(200).send(doc);
  }
  catch(error) {
    res.sendStatus(400);
  }
})

app.get('/todos', authenticate, async (req, res) => {
  try {
    const todos = await Todo.find({
      _creator: req.user._id
    });
    res.status(200).send(todos);
  }
  catch(error) {
    res.sendStatus(400);
  }
})

app.get('/todos/:id', authenticate, async (req, res) => {
  const id = req.params.id;
  if(ObjectID.isValid(id)) {
    try {
      const todo = await Todo.find({
        _id: new ObjectID(id),
        _creator: req.user._id
      });
      if(todo.length > 0) {
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

app.delete('/todos/:id', authenticate, async (req, res) => {
  const id = req.params.id;
  if(ObjectID.isValid(id)) {
    try {
      const todo = await Todo.findOneAndRemove({
        _id: id,
        _creator: req.user._id
      });
      if(todo) {
        res.status(200).send(todo);
      }
      else {
        res.sendStatus(404);
      }
    }
    catch(error) {
      res.sendStatus(404);
    }
  }
  else {
    res.sendStatus(400);
  }
})

app.patch('/todos/:id', authenticate, async (req, res) => {
  const id = req.params.id;
  const update = req.body;

  if(update.completed === true) {
    update.completedAt = new Date().getTime();
  }
  else if(update.completed === false) {
    update.completedAt = null;
  }
  if(ObjectID.isValid(id)) {
    try {
      const option = {
        returnOriginal: false
      }
      const todo = await Todo.findOneAndUpdate({
        _id: id,
        _creator: req.user._id
      }, 
      {
        $set: {...update}
      }, option);
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

app.post('/users', async (req, res) => {
  const user = new User({
    ...req.body
  })
  try {
    const token = await user.generateAuthToken();
    res.header('x-auth', token).send(user);
  }
  catch(error) {
    res.status(400).send(error);
  }
})

app.get('/users/me', authenticate, async (req, res) => {
  await res.send(req.user);
})

app.delete('/users/me/token', authenticate, async (req, res) => {
  try {
    await req.user.removeToken(req.token);
    res.sendStatus(200);
  }
  catch(error) {
    res.sendFile(400);
  }
})

app.post('/users/login', async (req, res) => {
  const { email, password } = req.body;
  if(validator.isEmail(email)) {
    try {
      const user = await User.findOne({ email });
      if(user) {
        bcrypt.compare(password, user.password, (error, success) => {
          if(error) {
            res.status(400).send('Unknown error');
          }
          else {
            if(success) {
              res.header('x-auth', user.tokens[0].token);
              res.status(200).send({
                _id: user._id,
                email: user.email
              })
            }
            else {
              res.status(401).send('Wrong password');
            }
          }
        })
      }
      else {
        res.status(404).send('Email address not found');
      }
    }
    catch(error) {
      res.status(400).send('Unknown error');
    }
  }
  else {
    res.status(400).send('Invalid email address');
  }
})

app.listen(port, () => {
  console.log('Server is running!');
})

module.exports = {
  app
}