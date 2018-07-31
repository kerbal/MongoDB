const { MongoClient, ObjectId } = require('mongodb');
const { link } = require('./config');

const updateDataByID = async (collection, id, update) => {
  try {
    const filter = {
      _id: new ObjectId(id)
    }
    const option = {
      returnOriginal: false
    }
    const result = await collection.findOneAndUpdate(
      filter, 
      { 
        $set: {...update}
      }, 
      option
    );
    console.log(result);
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

  const id = '5b5b1971a139c12238422936';
  const update = {
    text: 'eat'
  }
  await updateDataByID(database.collection('Todos'), id, update);

  client.close();
})