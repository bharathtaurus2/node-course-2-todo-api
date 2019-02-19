const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// var id = '5c6c447796fbca385c386f03';

// Todo.find({
//   _id: id
// }).then((todos) =>{
//   console.log('Todos',todos);
// });
//
// Todo.findOne({
//   _id: id
// }).then((todo)=>{
//   console.log('Todo',todo);
// });

var id = '5c680e39e1260f279847295f'

User.findById({
  _id: id
}).then((user) => {
  if(!user) {
    console.log("Invalid Id");
  }
  console.log(user);
}).catch((e) => {
  console.log(e);
});
