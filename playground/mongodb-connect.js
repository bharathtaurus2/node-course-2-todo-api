const {MongoClient, ObjectID} = require('mongodb');
MongoClient.connect('mongodb://localhost:27017/', (err, client) => {
  if(err) {
    return console.log('Unable to connect to mongodb server');
  }

  console.log('Connected to Mongodb Server');
  const db = client.db('TodoApp');

  // db.collection('Todos').insertOne({
  //   text: 'Something to do',
  //   completed: false
  // }, (err, result) => {
  //   if(err) {
  //     return console.log('Unable to insert db: Todos');
  //   }
  //   console.log(`Inserted new document to database: ${result}: ${JSON.stringify(result.ops, undefined, 2)}`);
  // });

  db.collection('Users').insertOne({
    name: 'Bharath Gopal',
    age: 33,
    location: 'Bangalore'
  }, (err, result) => {
    if(err) {
      return console.log('Unable to insert db: Users');
    }
    console.log(`Inserted new document to database: ${result}: ${JSON.stringify(result.ops, undefined, 2)}`);
  });
  client.close();
});
