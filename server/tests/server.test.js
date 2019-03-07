const {ObjectID} = require('mongodb');
const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');

const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateTodos);
beforeEach(populateUsers);

describe('POST /todos', () => {
  it('Should create a new todo', (done) => {

    var text = 'Remind me to pay my bills';

    request(app)
    .post('/todos')
    .set('x-auth', users[0].tokens[0].token)
    .send({text})
    .expect(200)
    .expect((res) => {
      expect(res.body.text).toBe(text);
    })
    .end((err, res) => {
      if(err) {
        return done(err);
      }
      Todo.find({
        text,
        _creator: res.body._creator
      }).then((todos) => {
        expect(todos.length).toBe(1);
        expect(todos[0].text).toBe(text);
        done();
      }).catch(e => {
        // console.log(e);
        done(e);
      });
    });
  });

  it('Should not create a todo data with invalid text', (done) => {
    request(app)
    .post('/todos')
    .set('x-auth', users[0].tokens[0].token)
    .send({})
    .expect(400)
    .end((err, res) => {
      if(err) {
        return done(err);
      }
      Todo.find({
        _creator: res.body._creator
      }).then((todos) => {
        expect(todos.length).toBe(0);
        done();
      }).catch((e) => done(e));
    });
  });
});

describe('GET /todos', () => {
  it('Should get all todos', (done) => {
    request(app)
    .get('/todos')
    .set('x-auth', users[0].tokens[0].token)
    .expect(200)
    .expect((res) => {
      expect(res.body.todos.length).toBe(1);
    })
    .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('Should get todo doc', (done) => {
    request(app)
    .get(`/todos/${todos[0]._id.toHexString()}`)
    .set('x-auth', users[0].tokens[0].token)
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.text).toBe(todos[0].text);
    })
    .end(done);
  });

  it('Should return 404 if _id is not valid', (done) => {
    request(app)
    .get(`/todos/123`)
    .set('x-auth', users[0].tokens[0].token)
    .expect(404)
    .end(done);
  });

  it('Should return 404 if todos is not found', (done) => {
    var hexId = new ObjectID().toHexString();
    request(app)
    .get(`/todos/${hexId}`)
    .set('x-auth', users[0].tokens[0].token)
    .expect(404)
    .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('Should delete a todo', (done) => {
    var hexId = todos[0]._id.toHexString();
    request(app)
    .delete(`/todos/${hexId}`)
    .set('x-auth', users[0].tokens[0].token)
    .expect(200)
    .expect((res) => {
      expect(res.body.todo).toBeTruthy();
      expect(res.body.todo._id).toBe(hexId);
    })
    .end((err, res) => {
      if(err) {
        return done(err);
      }

      Todo.findOne({_id: todos[0]._id, _creator: res.body._creator}).then((todos) => {
        expect(todos).not.toBeTruthy();
        done();
      }).catch((e) => done(e));
    });
  });

  it('Should return 404 if todo id is not found', (done) => {
    var id = new ObjectID().toHexString();
    request(app)
    .delete(`/todos/${id}`)
    .set('x-auth', users[0].tokens[0].token)
    .expect(404)
    .end(done);
  });

  it('Should return 404 if id is invalid', (done) => {
    request(app)
    .delete(`/todos/123`)
    .set('x-auth', users[0].tokens[0].token)
    .expect(404)
    .end(done);
  });
});

describe('UPDATE /todos/:id', () => {
  it('Should update the todo', (done) =>{
    var id = todos[0]._id.toHexString();
    var temp = {
      completed: true,
      text: "my new task"
    };
    request(app)
    .patch(`/todos/${id}`)
    .set('x-auth', users[0].tokens[0].token)
    .send(temp)
    .expect(200)
    .expect((res) => {
      expect(res.body.todo).toBeTruthy();
      expect(res.body.todo.text).toBe(temp.text);
    }).end((e, res) => {
      if(e) {
        return done(e);
      }
      Todo.findOne({_id: id, _creator: res.body.todo._creator}).then((doc) => {
        expect(doc).toBeTruthy();
        expect(doc.completed).toBe(true);
        expect(typeof doc.completedAt).toBe('number');
        done();
      }).catch((e) => done(e));
    });
  });

  it('Should clear the completedAt when todo is not completed', (done) => {
    var id = todos[1]._id.toHexString();
    var temp = {
      completed: false
    };
    request(app)
    .patch(`/todos/${id}`)
    .set('x-auth', users[1].tokens[0].token)
    .send(temp)
    .expect(200)
    .expect((res) => {
      expect(res.body.todo).toBeTruthy();
    }).end((e, res) => {
      if(e) {
        return done(e);
      }

      Todo.findOne({_id: id, _creator: res.body.todo._creator}).then((doc) => {
        expect(doc).toBeTruthy();
        expect(doc.completedAt).toBe(null);
        expect(doc.completed).toBe(false);
        done();
      }).catch(e => done(e));
    });
  });
});

describe('GET /users/me', () => {
  it('Should return a user if authenticated', (done) => {
    request(app)
    .get('/users/me')
    .set('x-auth', users[0].tokens[0].token)
    .expect(200)
    .expect((res) => {
      expect(res.body._id).toBe(users[0]._id.toHexString());
      expect(res.body.email).toBe(users[0].email);
    }).end(done);
  });

  it('Should return 401 if not authenticated', (done) => {
    request(app)
    .get('/users/me')
    .expect(401)
    .expect((res) => {
      expect(res.body).toEqual({});
    })
    .end(done);
  });
});


describe('POST /users', () => {
  it('Should create a user', (done) => {
    var user1 = {
      name: 'Yin',
      email: 'yinmin@xiaomi.com',
      password: '123mnb'
    }
    request(app)
    .post('/users')
    .send(user1)
    .expect(200)
    .expect((res) => {
      expect(res.headers['x-auth']).toBeTruthy();
      expect(res.body._id).toBeTruthy();
      expect(res.body.email).toBe(user1.email);
    }).end((err) => {
      if(err) {
        return done(err);
      }
      User.findOne({email: user1.email}).then((doc) => {
        expect(doc).toBeTruthy();
        expect(doc.password).not.toBe(user1.password);
        done();
      });
    });
  });

  it('Should return validation errors if request is invalid', (done) => {
    var user1 = {
      name: 'Ambi',
      email: 'ambikutti@',
      password: ''
    };
    request(app)
    .post('/users')
    .send(user1)
    .expect(400)
    .expect((res) => {
      expect(res.body.email).not.toBeTruthy();
    }).end(done);
  });

  it('Should not create user if email is in use', (done) => {
    request(app)
    .post('/users')
    .send(users[1])
    .expect(400)
    .expect((res) => {
      expect(res.body.email).not.toBeTruthy();
    }).end((err) => {
        if(err) {
          return done(err);
        }
        User.findOne({email: users[1].email}).then((doc) => {
          expect(doc).toBeTruthy();
          expect(doc.email).toBe(users[1].email);
          done();
        });
    });
  });
});

describe('POST /users/login', () => {
  it('Should login user and return auth token', (done) => {
    request(app)
    .post('/users/login')
    .send(users[1])
    .expect(200)
    .expect((res) => {
      expect(res.headers['x-auth']).toBeTruthy();
      expect(res.body.email).toBeTruthy();
    }).end((err, res) => {
      if(err) {
        return done(err);
      }
      User.findById(res.body._id).then(doc => {
        expect(doc.tokens[1]).toMatchObject({
          access: 'auth',
          token: res.headers['x-auth']
        });
        done();
      }).catch(e => done(e));
    });
  });

  it('Should reject invalid login', (done) => {
    var user1 = {
      email: users[0].email,
      password: 'asdf'
    }
    request(app)
    .post('/users/login')
    .send(user1)
    .expect(400)
    .expect((res) => {
      expect(res.body.email).not.toBeTruthy();
    }).end(done);
  });
});

describe('DELETE /users/me/token', () => {
  it('Should delete a token', (done) => {
    request(app)
    .delete('/users/me/token')
    .set('x-auth', users[1].tokens[0].token)
    .expect(200)
    .expect(res => {
      expect(res.header['x-auth']).not.toBeTruthy();
    }).end((e, r) => {
      if(e) {
        done(e);
      }
      User.findById(users[1]._id).then(doc =>{
        expect(doc).toBeTruthy();
        expect(doc.tokens.length).toBe(1);
        done();
      }).catch(e => done(e));
    })
  });
});
