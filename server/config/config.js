const env = process.env.NODE_ENV || 'development';

if (env === 'development') {
  console.log('env = development');
  process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
} else if (env === 'test') {
  console.log('env = test');
  process.env.PORT = 3000;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
}
