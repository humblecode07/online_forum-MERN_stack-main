const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require("mongoose");
const cors = require('cors')
const checkAuth = require('./middleware/check-auth')
const { MongoClient } = require('mongodb');

// ROUTERS
const indexRouter = require('./routes/index');
const refreshRouter = require('./routes/refreshToken');
const logoutRouter = require('./routes/logout');
const userRouter = require('./routes/user');
const instructorRouter = require('./routes/instructor')
const forumRouter = require('./routes/forum');
const threadRouter = require('./routes/thread');
const commentRouter = require('./routes/comment');
const imageRouter = require('./routes/image')

const app = express();
app.use(cors({ origin: true, credentials: true, methods: "GET,HEAD,PUT,PATCH,POST,DELETE" }));

app.use(express.json());

mongoose.set("strictQuery", false);
const mongoDB = "mongodb+srv://sakayanagi:" + process.env.MONGO_ATLAS_PW + "@cluster0.nciqe98.mongodb.net/ol_disc_forum?retryWrites=true&w=majority&appName=Cluster0";

const dbName = 'ol_disc_forum'
const client = new MongoClient(mongoDB)

main().catch((err) => console.log(err));
async function main() {
  try {
    await client.connect();
    console.log('Connected to MongoDB server');
    const db = client.db(dbName);
    const { GridFSBucket } = require('mongodb');
    global.gridFSBucket = new GridFSBucket(db, {
      bucketName: 'uploads'
    });
  }
  catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
  await mongoose.connect(mongoDB);
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'))

const extractForumId = (req, res, next) => {
  const { forumId } = req.params;
  req.forumId = forumId;
  next();
};

const extractThreadId = (req, res, next) => {
  const { threadId } = req.params;
  req.threadId = threadId;
  next();
};

app.use('/', indexRouter);
app.use('/refresh', refreshRouter);
app.use('/logout', logoutRouter);
app.use('/images', imageRouter)

app.use(checkAuth)
app.use('/users', userRouter)
app.use('/instructors', instructorRouter)
app.use('/forums', forumRouter)
app.use('/threads', threadRouter)
app.use('/forums/:forumId/threads', extractForumId, threadRouter)
app.use('/comments', commentRouter)
app.use('/forums/:forumId/threads/:threadId/comments', extractThreadId, commentRouter)


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;