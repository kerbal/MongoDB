const { MongoClient } = require('mongodb');
const { link } = require('./config');

const fetchData = async (collection, filter = {}) => {
  try {
    const dataArray = await collection.find(filter).toArray();
    return dataArray;
  }
  catch(error) {
    console.log('Error: Can not fetch data!!!');
  }
}

MongoClient.connect(link, async (error, client) => {
  if(error) {
    return console.log('Error: Can not connect to database!!!');
  }
  console.log('Connected to database!');

  const database = client.db('TodoApp');

  try {
    const users = await fetchData(database.collection('Users'));
    console.log(JSON.stringify(users, undefined, 2));

    const filter = {
      completed: true
    }
    const todos = await fetchData(database.collection('Todos'), filter);
    console.log(JSON.stringify(todos, undefined, 2));
  }
  catch(error) {
    console.log(error);
  }

  client.close();
})