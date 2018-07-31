const { mongoose } = require('../server/db/mongoose');
const { Todo } = require('../server/models/todo');
const { ObjectID } = require('mongodb');

const id = '5b5ffc94d271e627241658b6';

Todo.findById(id).then((todos) => {
  console.log(todos);
})

mongoose.disconnect();