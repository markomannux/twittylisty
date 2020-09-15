require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
const session     = require('express-session');
const MongoStore = require('connect-mongo')(session);
var logger = require('morgan');
const mongo       = require('mongodb').MongoClient;
const passport    = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var usersRouter = require('./routes/users');
var listsRouter = require('./routes/lists');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

mongo.connect(
  process.env.MONGODB_URI,
  { useUnifiedTopology: true },
  (err, client) => {

  if (err) {
    console.log('Database errore: ' + err);
    return;
  }

  app.use(session({
    secret: process.env.COOKIE_KEY,
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({client: client})
  }));
  app.use(passport.initialize());
  app.use(passport.session());


  passport.serializeUser((user, done) => {
    done(null, user.twitterId);
  });

  passport.deserializeUser((id, done) => {
      client.db().collection('twitterusers').findOne(
          {twitterId: id},
          (err, doc) => {
              done(null, doc);
          }
      );
  });

  passport.use(new TwitterStrategy({
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: "/oauth/callback"
    }, 
    function(accessToken, tokenSecret, profile, cb) {
      console.log(profile);
      client.db().collection('twitterusers').findAndModify(
        {twitterId: profile.id},
        {},
        {$setOnInsert: {
          twitterId: profile.id,
          username: profile.username,
          displayName: profile.displayName
        }, $set: {
          last_login: new Date(),
          accessToken: accessToken,
          tokenSecret: tokenSecret
        }, $inc: {
          login_count: 1
        }},
        {upsert: true, new: true},
        (err, doc) => {
          return cb(null, doc.value);
        }
      )
    })
  )

  app.use('/', indexRouter);
  app.use('/', authRouter);
  app.use('/lists', listsRouter);
  
  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

});

module.exports = app;
