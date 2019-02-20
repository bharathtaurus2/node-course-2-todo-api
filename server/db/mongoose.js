const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true});
//mongoose.connect('mongodb+srv://bharath_taurus2:thtnikgh1@cluster0-fxqym.mongodb.net/Todos?retryWrites=true',
//{useNewUrlParser: true});
mongoose.connect('mongodb://bharath_taurus2:thtnikgh1@cluster0-shard-00-00-fxqym.mongodb.net:27017,cluster0-shard-00-01-fxqym.mongodb.net:27017,cluster0-shard-00-02-fxqym.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true',
{useNewUrlParser: true});
module.exports = {mongoose};
