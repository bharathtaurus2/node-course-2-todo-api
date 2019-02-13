const {MongoClient, ObjectID} = require('Mongodb');

MongoClient.connect('mongodb://localhost:27017/', (err, client) => {
  if(err) {
    return console.log('Unable to connect to the MongoDB server');
  }

  const db = client.db('TodoApp');
  db.collection('Users').findOneAndUpdate({_id: new ObjectID('5c636276f6971f26d8f97117')},
  {$set:{name: "Karthik"}, $inc: {age: 3}}, {returnOriginal: false}).then((result) => {
    console.log(result);
  });
});
