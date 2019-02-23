const {ObjectID} = require('mongodb');
const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
  _id: new ObjectID(),
  text: "clean my cupboard"
},{
  _id: new ObjectID(),
  text: "wash my clothes",
  completed: true,
  completedAt: 333
}];

beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
});

describe('POST /todos', () => {
  it('Should create a new todo', (done) => {

    var text = 'Remind me to pay my bills';

    request(app)
    .post('/todos')
    .send({text})
    .expect(200)
    .expect((res) => {
      expect(res.body.text).toBe(text);
    })
    .end((err, res) => {
      if(err) {
        return done(err);
      }

      Todo.find({text}).then((todos) => {
        expect(todos.length).toBe(1);
        expect(todos[0].text).toBe(text);
        done();
      }).catch(e => {
        console.log(e);
        done(e);
      });
    });
  });

  it('Should not create a todo data with invalid text', (done) => {
    request(app)
    .post('/todos')
    .send({})
    .expect(400)
    .end((err, res) => {
      if(err) {
        return done(err);
      }
      Todo.find().then((todos) => {
        expect(todos.length).toBe(2);
        done();
      }).catch((e) => done(e));
    });
  });
});

describe('GET /todos', () => {
  it('Should get all todos', (done) => {
    request(app)
    .get('/todos')
    .expect(200)
    .expect((res) => {
      expect(res.body.todos.length).toBe(2);
    })
    .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('Should get todo doc', (done) => {
    request(app)
    .get(`/todos/${todos[0]._id.toHexString()}`)
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.text).toBe(todos[0].text);
    })
    .end(done);
  });

  it('Should return 404 if _id is not valid', (done) => {
    request(app)
    .get(`/todos/123`)
    .expect(404)
    .end(done);
  });

  it('Should return 404 if todos is not found', (done) => {
    var hexId = new ObjectID().toHexString();
    console.log(`hexId: ${hexId}`);
    request(app)
    .get(`/todos/${hexId}`)
    .expect(404)
    .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('Should delete a todo', (done) => {
    var hexId = todos[0]._id.toHexString();
    console.log(`Hex ID: ${hexId}`);
    request(app)
    .delete(`/todos/${hexId}`)
    .expect(200)
    .expect((res) => {
      expect(res.body.todo).toBeTruthy();
      expect(res.body.todo._id).toBe(hexId);
    })
    .end((err, res) => {
      if(err) {
        return done(err);
      }

      Todo.findById(todos[0]._id).then((todos) => {
        expect(todos).not.toBeTruthy();
        done();
      }).catch((e) => done(e));
    });
  });

  it('Should return 404 if todo id is not found', (done) => {
    var id = new ObjectID().toHexString();
    request(app)
    .delete(`/todos/${id}`)
    .expect(404)
    .end(done);
  });

  it('Should return 404 if id is invalid', (done) => {
    request(app)
    .delete(`/todos/123`)
    .expect(404)
    .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('Should update the todo', (done) =>{
    var id = todos[0]._id.toHexString();
    var temp = {
      completed: true,
      text: "my new task"
    };
    request(app)
    .patch(`/todos/${id}`)
    .send(temp)
    .expect(200)
    .expect((res) => {
      expect(res.body.todo).toBeTruthy();
      expect(res.body.todo.text).toBe(temp.text);
    }).end((e, res) => {
      if(e) {
        return done(e);
      }
      Todo.findById(id).then((doc) => {
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
    .send(temp)
    .expect(200)
    .expect((res) => {
      expect(res.body.todo).toBeTruthy();
    }).end((e, res) => {
      if(e) {
        return done(e);
      }

      Todo.findById(id).then((doc) => {
        expect(doc).toBeTruthy();
        expect(doc.completedAt).toBe(null);
        expect(doc.completed).toBe(false);
        done();
      }).catch(e => done(e));
    });
  });
});
