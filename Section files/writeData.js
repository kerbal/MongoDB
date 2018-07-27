const MongoClient = require('mongodb').MongoClient;

const link = 'mongodb://localhost:27017/TodoApp';

const insertNew = (collection, data) => {
  collection.insertOne(data, (error, result) => {
    if(error) {
      return console.log(error);
    }
    console.log(JSON.stringify(result.ops[0]._id.getTimestamp(), undefined, 2));
  })
}

MongoClient.connect(link, (error, client) => {
  if(error) {
    return console.log(error);
  }
  console.log('Connected to MongoDB!');

  const database = client.db('TodoApp');
  
  const user = {
    name: 'kerbal',
    age: 19,
    location: 'VN'
  }
  insertNew(database.collection('Users'), user);

  const thingToDo = {
    text: 'something to do',
    completed: false
  }
  insertNew(database.collection('Todos'), thingToDo);

  client.close();
})