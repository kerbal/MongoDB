const { MongoClient } = require('mongodb');
const { link } = require('./config');

const removeData = async (collection, filter) => {
  try {
    await collection.deleteMany(filter);
  }
  catch(error) {
    console.log(error);
  }
}

MongoClient.connect(link, async (error, client) => {
  if(error) {
    return console.log('Error: Can not connect to database');
  }
  console.log('Connected!');

  const database = client.db('TodoApp');

  const filter = {
    completed: true
  }

  await removeData(database.collection('Todos'), filter);

  client.close();
})