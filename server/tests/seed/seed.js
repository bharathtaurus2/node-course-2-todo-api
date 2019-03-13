const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const todos = [{
  _id: new ObjectID(),
  text: "clean my cupboard",
  _creator: userOneId
},{
  _id: new ObjectID(),
  text: "wash my clothes",
  completed: true,
  completedAt: 333,
  _creator: userTwoId
}];

const users = [{
  _id: userOneId,
  name: 'Penelope',
  email: 'penelope@pingpong.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}, {
  _id: userTwoId,
  name: 'Kirin',
  email: 'kirin@mashimoto.org',
  password: 'userTwoPass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoId, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}];

const populateTodos = (done) => {
  Todo.deleteMany({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
};

const populateUsers = (done) => {
  User.deleteMany({}).then(() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();
    return Promise.all([userOne, userTwo]);
  }).then(() => done());
};

module.exports = {
  todos,
  populateTodos,
  users,
  populateUsers
};
