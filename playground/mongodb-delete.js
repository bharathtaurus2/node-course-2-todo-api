const {MongoClient, ObjectID} = require('Mongodb');

MongoClient.connect('mongodb://localhost:27017/', (err, client) => {
  if(err) {
    return console.log('Unable to connect to the MongoDB server');
  }

  const db = client.db('TodoApp');
  // db.collection('Todos').deleteMany({text: 'Eat Lunch'}).then((result) => {
  //   console.log(result);
  // });

  // db.collection('Todos').deleteOne({text: 'Eat Lunch'}).then((result) => {
  //   console.log(result);
  //});

  db.collection('Users').findOneAndDelete({name: 'Bharath Gopal'}).then((result) => {
    console.log(result);
  });
});
