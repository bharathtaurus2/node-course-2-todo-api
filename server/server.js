const conf = require('./config/config');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');

var app = express();



const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });
  todo.save().then((doc) => {
    return res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos', authenticate, (req, res) => {
  Todo.find({
    _creator: req.user._id
  }).then((todos) => {
    return res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;
  if(!ObjectID.isValid(id)) {
    return res.status(404).send({error: "Request contains invalid id!"});
  }

  Todo.findOne({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
    if(!todo) {
      return res.status(404).send({error: "Requested id not found!"});
    }
    res.send({todo});
  }).catch((e) => {
    res.status(400).send({});
  });
});

app.delete('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send({error: "Request contains invalid id!"});
  }

  Todo.findByIdAndDelete({_id: id, _creator: req.user._id}).then((todo) => {
    if(!todo) {
      return res.status(404).send({error: "Could not delete id!"});
    }
    return res.send({todo});
  }).catch((e) => {
    res.status(400).send({e});
  });
});

app.patch('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;
  if(!ObjectID.isValid(id)) {
    return res.status(404).send({error: "Request contains invalid id!"});
  }
  var body = _.pick(req.body,['text', 'completed']);
    Todo.findOne({
      _id: id,
      _creator: req.user._id
    }).then((temp)=> {
      if (!temp) {
        throw {
          status: 404,
          error: "Could not find todo with id to update!"
        }
      }
      if(temp.completed && _.isBoolean(body.completed) && body.completed) {
         throw {
           status: 404,
           error: "todo is already set to completed!"
         }
      } else if(_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
      } else {
        body.completedAt = null;
        body.completed = false;
      }
      return temp;
    }).then(() => {
      mongoose.set('useFindAndModify', false);
      Todo.findOneAndUpdate({
        _id: id,
        _creator: req.user._id
      }, {$set: body}, {new: true}).then((todo) => {
        if(!todo) {
          return res.status(404).send({error: "Could not update todo at id"});
        }
        return res.send({todo});
      });
    }).catch((e) => {
      if(e.status != undefined) {
        res.status(e.status);
      } else {
        res.status(400);
      }
      res.send({error: e.error});
    });
});

app.post('/users/', (req, res) => {
  var {name} = req.body;
  var {email} = req.body;
  var {password} = req.body;

  var user = new User({
    name,
    email,
    password
  });
  user.save().then(() => {
    if(!user) {
      console.log(user);

      return Promise.reject({
        status: 404,
        message: 'Could not save doc'
      });
    }
    return user.generateAuthToken(user);
  })
  .then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    console.log(e);

    if(e.status) {
      res.status(e.status);
    } else {
      res.status(400);
    }
    res.send({error: e.toString()});
  });
});

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.post('/users/login', (req, res) => {
  var {email} = req.body;
  var {password} = req.body;
  User.findByCredentials(email, password).then(user => {
    return user.generateAuthToken().then(token => {
        res.header('x-auth', token).send(user);
    });
  }).catch(e => {
    res.status(400).send();
  });
});

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.tokens[0].token).then(doc => {
    if(!doc) {
      return Promise.reject({status:404});
    }
    res.status(200).send();
  }).catch(e => {
    if(e.status) {
      res.status(e.status);
    } else {
      res.status(400);
    }
    res.send();
  });
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = {app};
