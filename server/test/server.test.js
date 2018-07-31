const request = require('supertest');
const { app } = require('../server');
const { Todo } = require('../models/todo');
const { mongoose } = require('../db/mongoose');

beforeEach(async (done) => {
  await Todo.remove({});
  done();
})

afterAll(async (done) => {
  try {
    await Todo.remove({});
    await mongoose.disconnect();
  }
  catch(error) {
    console.log(error);
  }
  done();
})

describe('Todo', () => {
  test('Should create a new Todo', async (done) => {
    const text = 'Code';
    const response = await request(app).post('/todos').send({
      text
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      _id: expect.any(String),
      text,
      completed: false,
      completedAt: null,
      __v: expect.any(Number)
    })
    done();
  })

  test('Should return 400', async (done) => {
    const response = await request(app).post('/todos').send({});
    expect(response.statusCode).toBe(400);
    done();
  })

  test('Should return empty Todos array', async (done) => {
    const response = await request(app).get('/todos');
    expect(response.body).toEqual([]);
    done();
  })

  test('Should return all Todos', async (done) => {
    const todos = [
      {
        text: 'a'
      },
      {
        text: 'b'
      }
    ];
    await Todo.insertMany(todos);
    const response = await request(app).get('/todos');
    expect(response.statusCode).toBe(200);
    expect(response.body[0].text).toBe('a');
    expect(response.body[1].text).toBe('b');
    done();
  })
})

describe('Query on Todo', () => {
  const wrongID = '5b600e07d02d670290c79b19';
  const invalidID = '5b600e07d02d670290c';

  test('Should response "not found"', async (done) => {
    const response = await request(app).get(`/todos/${wrongID}`);
    expect(response.statusCode).toBe(404);
    done();
  })

  test('Should response "bad request"', async (done) => {
    const response = await request(app).get(`/todos/${invalidID}`);
    expect(response.statusCode).toBe(400);
    done();
  })

  test('Should response correctly', async (done) => {
    const text = 'Code';
    const todo = await request(app).post('/todos').send({
      text
    });
    const id = todo.body._id;
    const response = await request(app).get(`/todos/${id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      _id: id,
      text: 'Code',
      completed: false,
      completedAt: null,
      __v: expect.any(Number)
    });
    done();
  })
})