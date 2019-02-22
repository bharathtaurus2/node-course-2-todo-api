const _ = require('lodash');
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

app.patch('/todos/:id', (req, res) => {
  var id = req.params.id;
  if(!ObjectID.isValid(id)) {
    return res.status(404).send({error: "Request contains invalid id!"});
  }
  var body = _.pick(req.body,['text', 'completed']);
    Todo.findById(id).then((temp)=> {
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
      Todo.findOneAndUpdate({_id: id}, {$set: body}, {new: true}).then((todo) => {
        if(!todo) {
          return res.status(404).send({error: "Could not update todo at id"});
        }
        return res.send(todo);
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

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = {app};
