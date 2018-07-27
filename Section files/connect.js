const MongoClient = require('mongodb').MongoClient;

const link = 'mongodb://localhost:27017/TodoApp';

MongoClient.connect(link, (error, client) => {
  if(error) {
    return console.log(error);
  }
  console.log('Connected to MongoDB!');

  client.close();
})