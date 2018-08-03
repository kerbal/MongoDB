const request = require('supertest');
const { app } = require('../server');
const { Todo } = require('../models/todo');
const { User } = require('../models/user');
const { mongoose } = require('../db/mongoose');

beforeEach(async (done) => {
  await Todo.remove({});
  await User.remove({});
  done();
})

afterAll(async (done) => {
  await Todo.remove({});
  await mongoose.disconnect();
  done();
})

describe('POST /todos - Create new todos', () => {
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
})

describe('GET /todos - Get all todo', () => {
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

  describe('GET /todos/:id - Find a todo', () => {
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

  describe('DELETE /todos/:id - Delete a todo', () => {
    test('Should response "not found"',async (done) => {
      const response = await request(app).delete(`/todos/${wrongID}`);
      expect(response.statusCode).toBe(404);
      done();
    })

    test('Should response "bad request"',async (done) => {
      const response = await request(app).delete(`/todos/${invalidID}`);
      expect(response.statusCode).toBe(400);
      done();
    })

    test('Should delete correctly', async (done) => {
      const todo = await request(app).post('/todos').send({text: 'Code'});
      const id = todo.body._id;
      const response = await request(app).delete(`/todos/${id}`);
      expect(response.body).toEqual({
        _id: id,
        text: 'Code',
        completed: false,
        completedAt: null,
        __v: expect.any(Number)
      })
      const allTodo = await request(app).get('/todos');
      expect(allTodo.body).toEqual([]);
      done();
    })
  })
})

const user = new User({
  email: 'kerbal@gmail.com',
  password: 'abc123'
})

const expectedUser = {
  "_id" : expect.any(String),
  "email" : "kerbal@gmail.com"
}

describe('POST /users - Create new user', () => {
  test('Should response "bad request" for invalid email', async (done) => {
    user.email = 'abc123';
    const response = await request(app).post('/users').send(user);
    expect(response.status).toBe(400);
    user.email = 'kerbal@gmail.com'
    done();
  })

  test('Should create new user correctly', async (done) => {
    const response = await request(app).post('/users').send(user);
    expect(response.body).toEqual(expectedUser);
    expect(response.header['x-auth']).toEqual(expect.any(String));
    done();
  })
})

describe('GET /users/me - Get user', () => {
  test('Should response 401', async (done) => {
    const response = await request(app).get('/users/me');
    expect(response.statusCode).toBe(401);
    done();
  })

  test('Should return a user', async (done) => {
    const req = await request(app).post('/users').send(user);
    const token = req.header['x-auth'];
    const response = await request(app).get('/users/me')
      .set('x-auth', token);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(expectedUser);
    done();
  })
})

describe('POST /users/login - Login', () => {
  const wrongEmail = 'kerbal123@gmail.com';
  const invalidEmail = 'kerbal';
  const validEmail = 'kerbal@gmail.com';
  const wrongPassword = 'abc123';
  const validPassword = 'abc123!';

  test('Should response "wrong email"', async (done) => {
    const response = await request(app).post('/users/login').send({
      email: wrongEmail, 
      password: validPassword
    });
    expect(response.statusCode).toBe(404);
    expect(response.text).toBe('Email address not found');
    done();
  })

  test('Should response "Invalid"', async (done) => {
    const response = await request(app).post('/users/login').send({
      email: invalidEmail,
      password: validPassword
    });
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('Invalid email address');
    done();
  })

  test('Should response "Wrong password"', async (done) => {
    await request(app).post('/users').send({
      email: validEmail,
      password: validPassword
    })
    const response = await request(app).post('/users/login').send({
      email: validEmail,
      password: wrongPassword
    });
    expect(response.statusCode).toBe(401);
    expect(response.text).toBe('Wrong password');
    done();
  })

  test('Should response correctly', async (done) => {
    await request(app).post('/users').send({
      email: validEmail,
      password: validPassword
    })
    const response = await request(app).post('/users/login').send({
      email: validEmail,
      password: validPassword
    });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.text)).toEqual({
      _id: expect.any(String),
      email: validEmail
    });
    done();
  })
})

describe('DELETE /users/me/token', () => {
  test('Should response correctly', async (done) => {
    const response_1 = await request(app).post('/users').send({
      email: 'kerbal@gmail.com',
      password: 'abc123!'
    })
    const token = response_1.header['x-auth'];
    const id = response_1.body._id;
    await request(app).delete('/users/me/token').set('x-auth', token);
    const user = await User.findById(id);
    expect(user.tokens.length).toBe(0);
    done();
  })
})