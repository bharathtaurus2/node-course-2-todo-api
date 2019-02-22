const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  var todo = new Todo({text: req.body.text});
  todo.save().then((doc) => {
    return res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    return res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos/:id', (req, res) => {
  var id = req.params.id;
  if(!ObjectID.isValid(id)) {
    return res.status(404).send({error: "Request contains invalid id!"});
  }

  Todo.findById(id).then((todo) => {
    if(!todo) {
      return res.status(404).send({error: "Requested id not found!"});
    }
    res.send({todo});
  }).catch((e) => {
    res.status(400).send({});
  });
});

app.delete('/todos/:id', (req, res) => {
  var id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send({error: "Request contains invalid id!"});
  }

  Todo.findByIdAndDelete(id).then((todo) => {
    if(!todo) {
      return res.status(404).send({error: "Could not delete id!"});
    }
    return res.send({todo});
  }).catch((e) => {
    res.status(400).send({e});
  });
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = {app};
