const {MongoClient, ObjectID} = require('mongodb');
MongoClient.connect('mongodb://localhost:27017/', (err, client) => {
  if(err) {
    return console.log('Unable to connect to mongodb server');
  }

  console.log('Connected to Mongodb Server');
  const db = client.db('TodoApp');
  db.collection('Users').find({name:'Bharath Gopal'}).count().then((count)=> {
    console.log(JSON.stringify(count, undefined, 2));
  }, (err) => {
    console.log('Could not find document');
  });
});
