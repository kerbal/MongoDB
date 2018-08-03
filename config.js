const currentDatabase = 'mongodb://localhost:27017/TodoApp';
const testDatabase = 'mongodb://localhost:27017/TodoAppTest';

let link;

if(process.env.NODE_ENV === 'test') {
  link = testDatabase;
}
else {
  link = currentDatabase;
}

module.exports = {
  link
}