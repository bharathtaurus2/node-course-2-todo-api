const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true});
mongoose.connect('mongodb+srv://bharath_taurus2:thtnikgh1@cluster0-fxqym.mongodb.net/Todos?retryWrites=true',
{useNewUrlParser: true});

module.exports = {mongoose};
